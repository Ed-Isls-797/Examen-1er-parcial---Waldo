// Instancias globales para el mapa de Leaflet
let mapa;
let marcadorUsuario = null;
let marcadorEstadio = null;

// Arreglos donde guardaremos las instancias de objetos procesados
let instanciasEquipos = [];
let instanciasPromos = [];

// Variables de estado para el control de enrutamiento acumulativo
let posicionUsuarioActual = null;     // Guarda {lat, lng} activos del usuario
let objetoEstadioSeleccionado = null;  // Guarda la instancia del equipo seleccionado
const historialRutas = [];             // Almacena las instancias de rutas creadas

// Paleta de colores para diferenciar cada trazo en el mapa de forma secuencial
const coloresRutas = ['#ff4c05', '#00bc8c', '#3498db', '#9b59b6', '#f1c40f', '#e74c3c', '#1abc9c'];
let indiceColor = 0;

// Al cargar el DOM, levantamos el proyecto
document.addEventListener("DOMContentLoaded", () => {
    inicializarMapa();
    cargarServiciosDatos();
    registrarEventosUI();
});

// Inicialización limpia del mapa
function inicializarMapa() {
    // Coordenadas iniciales (Pachuca de Soto, Hidalgo)
    mapa = L.map('map').setView([20.1011, -98.7591], 5); 

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(mapa);
}

// Carga asíncrona simulando Servicios Orientados a Servicios (SOA)
async function cargarServiciosDatos() {
    try {
        // Apuntamos directo a la carpeta 'Datos/' como muestra tu estructura
        const resEquipos = await fetch('Datos/equipos.json');
        const dataEquipos = await resEquipos.json();

        const resPromos = await fetch('Datos/promociones.json');
        const dataPromos = await resPromos.json();

        // Mapeamos los JSON crudos a instancias reales de POO
        instanciasEquipos = dataEquipos.map(item => {
            if (item.id >= 1 && item.id <= 5) {
                return new EquiposAmericano(item.id, item.nombre, item.pais, item.ciudad, item.historia, item.latitud, item.longitud, item.entrenador, item.patrocinadores, item.jugadoresPro, item.ventajas, item.desventajas);
            } else if (item.id >= 6 && item.id <= 10) {
                return new EquiposFutbol(item.id, item.nombre, item.pais, item.ciudad, item.historia, item.latitud, item.longitud, item.entrenador, item.patrocinadores, item.jugadoresPro, item.ventajas, item.desventajas);
            } else {
                return new EquiposBaskquet(item.id, item.nombre, item.pais, item.ciudad, item.historia, item.latitud, item.longitud, item.entrenador, item.patrocinadores, item.jugadoresPro, item.ventajas, item.desventajas);
            }
        });

        instanciasPromos = dataPromos.map(p => new Promocion(p.id_equipo, p.equipo, p.promocion, p.descripcion, p.patrocinador_asociado, p.descuento_beneficio));

        console.log("Servicios de Datos Cargados e Instanciados Exitosamente.");
    } catch (error) {
        console.error("Error al procesar los archivos JSON del servicio:", error);
    }
}

// Registro de controladores de eventos para los selectores y botones
function registrarEventosUI() {
    const sportSelector = document.getElementById('sport-selector');
    const stadiumSelector = document.getElementById('stadium-selector');
    const btnLocation = document.getElementById('btn-my-location');
    const btnRoute = document.getElementById('btn-generate-route');
    const cards = document.querySelectorAll('.card-deporte');

    // Sincronizar Clic en Tarjetas Superiores
    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            const deporte = card.getAttribute('data-sport');
            sportSelector.value = deporte;
            actualizarDesplegableEstadios(deporte);
        });
    });

    // Cambios directos en el combobox de Deporte
    sportSelector.addEventListener('change', (e) => {
        actualizarDesplegableEstadios(e.target.value);
    });

    // Cambios al elegir un Estadio
    stadiumSelector.addEventListener('change', (e) => {
        const idSeleccionado = parseInt(e.target.value);
        if (idSeleccionado) {
            enfocarEstadioEnMapa(idSeleccionado);
        }
    });

    // Botón Geolocalización Activa
    btnLocation.addEventListener('click', procesarGeolocalizacion);

    // Botón para trazar la ruta multicolor acumulativa
    btnRoute.addEventListener('click', calcularYAsignarRutaMulticolor);
}

// Rellena el menú desplegable secundario basándose en el deporte
function actualizarDesplegableEstadios(deporte) {
    const stadiumSelector = document.getElementById('stadium-selector');
    stadiumSelector.innerHTML = '<option value="">Selecciona un estadio...</option>';

    if (!deporte) {
        stadiumSelector.disabled = true;
        document.getElementById('stadium-info-block').style.display = 'none';
        document.getElementById('promo-info-block').style.display = 'none';
        objetoEstadioSeleccionado = null;
        comprobarRequisitosRuta();
        return;
    }

    let equiposFiltrados = [];
    if (deporte === 'americano') {
        equiposFiltrados = instanciasEquipos.filter(e => e instanceof EquiposAmericano);
    } else if (deporte === 'futbol') {
        equiposFiltrados = instanciasEquipos.filter(e => e instanceof EquiposFutbol);
    } else if (deporte === 'basquet') {
        equiposFiltrados = instanciasEquipos.filter(e => e instanceof EquiposBaskquet);
    }

    equiposFiltrados.forEach(equipo => {
        const opt = document.createElement('option');
        opt.value = equipo.id;
        opt.textContent = `${equipo.nombre} (${equipo.ciudad})`;
        stadiumSelector.appendChild(opt);
    });

    stadiumSelector.disabled = false;
    comprobarRequisitosRuta();
}

// Coloca el marcador del Estadio y extrae su promo asociada
function enfocarEstadioEnMapa(idEquipo) {
    const equipo = instanciasEquipos.find(e => e.id === idEquipo);
    const promo = instanciasPromos.find(p => p.id_equipo === idEquipo);

    if (!equipo) return;

    // Guardamos la referencia global del objeto seleccionado
    objetoEstadioSeleccionado = equipo;

    // Pintar marcador en el mapa
    if (marcadorEstadio) {
        marcadorEstadio.setLatLng([equipo.latitud, equipo.longitud]);
    } else {
        marcadorEstadio = L.marker([equipo.latitud, equipo.longitud]).addTo(mapa);
    }

    marcadorEstadio.bindPopup(`<b>Estadio de ${equipo.nombre}</b><br>${equipo.ciudad}`).openPopup();
    mapa.setView([equipo.latitud, equipo.longitud], 13);

    // Renderizar la información en los bloques ocultos del Sidebar
    const infoBlock = document.getElementById('stadium-info-block');
    const detailsPara = document.getElementById('stadium-details');
    detailsPara.innerHTML = equipo.obtenerDetallesHtml();
    infoBlock.style.display = 'block';

    const promoBlock = document.getElementById('promo-info-block');
    const promoPara = document.getElementById('promo-details');
    if (promo) {
        promoPara.innerHTML = promo.obtenerPromoHtml();
        promoBlock.style.display = 'block';
    } else {
        promoBlock.style.display = 'none';
    }

    // Configurar enlaces para compartir
    configurarBotonesCompartir(equipo);

    // Validar si el botón de ruta ya se puede desbloquear
    comprobarRequisitosRuta();
}

// Función de geolocalización en tiempo real solicitando accesos al navegador
function procesarGeolocalizacion() {
    if (!navigator.geolocation) {
        alert("Tu entorno o navegador no tiene soporte de geolocalización.");
        return;
    }

    navigator.geolocation.getCurrentPosition(posicion => {
        const lat = posicion.coords.latitude;
        const lng = posicion.coords.longitude;

        // Guardamos las coordenadas activas del usuario
        posicionUsuarioActual = { lat: lat, lng: lng };

        if (marcadorUsuario) {
            marcadorUsuario.setLatLng([lat, lng]);
        } else {
            marcadorUsuario = L.marker([lat, lng]).addTo(mapa)
                .bindPopup("<b>Estás aquí</b>").openPopup();
        }

        mapa.setView([lat, lng], 14);

        // Validar si el botón de ruta ya se puede desbloquear
        comprobarRequisitosRuta();
    }, error => {
        alert("Permiso denegado o error de lectura de GPS: " + error.message);
    }, {
        enableHighAccuracy: true
    });
}

// Verifica la existencia de ambos puntos para habilitar el botón de generación de rutas
function comprobarRequisitosRuta() {
    const btnRoute = document.getElementById('btn-generate-route');
    if (posicionUsuarioActual && objetoEstadioSeleccionado) {
        btnRoute.disabled = false;
    } else {
        btnRoute.disabled = true;
    }
}

// Genera trazos de enrutamiento independientes y acumulativos con colores distintos
function calcularYAsignarRutaMulticolor() {
    if (!posicionUsuarioActual || !objetoEstadioSeleccionado) {
        alert("Faltan datos de origen o destino. Por favor, marca tu ubicación y selecciona un estadio.");
        return;
    }

    // Elección secuencial del color para esta ruta en específico
    const colorSeleccionado = coloresRutas[indiceColor % coloresRutas.length];
    indiceColor++;

    // Creamos un nuevo control aislado para evitar borrar las capas de trazado previas
    const nuevaRutaControl = L.Routing.control({
        waypoints: [
            L.latLng(posicionUsuarioActual.lat, posicionUsuarioActual.lng),
            L.latLng(objetoEstadioSeleccionado.latitud, objetoEstadioSeleccionado.longitud)
        ],
        router: L.Routing.osrmv1({
            serviceUrl: 'https://router.project-osrm.org/route/v1'
        }),
        // Evita que el plugin dibuje pines por defecto encima de nuestros marcadores
        createMarker: function() { return null; },
        
        // Estilo e inyección dinámica del color correspondiente
        lineOptions: {
            styles: [
                { color: colorSeleccionado, opacity: 0.85, weight: 6 }
            ]
        },
        show: false // Oculta la caja de texto lateral de direcciones paso a paso
    }).addTo(mapa);

    // Adjuntar los detalles del viaje al bloque informativo cuando la ruta sea devuelta por el servidor OSRM
    nuevaRutaControl.on('routesfound', function(e) {
        const ruta = e.routes[0];
        const distanciaKm = (ruta.summary.totalDistance / 1000).toFixed(2);
        const tiempoMin = Math.round(ruta.summary.totalTime / 60);

        const parrafoDetalles = document.getElementById('stadium-details');
        if (parrafoDetalles) {
            parrafoDetalles.innerHTML += `<br><br><span style="color:${colorSeleccionado}; font-weight:bold;">
                • Ruta generada hacia ${objetoEstadioSeleccionado.nombre}: ${distanciaKm} km (~${tiempoMin} min)</span>`;
        }
    });

    // Guardamos la referencia en memoria
    historialRutas.push(nuevaRutaControl);

    // Encuadre de cámara automático para englobar el nuevo trayecto completo en pantalla
    const bounds = L.latLngBounds([
        [posicionUsuarioActual.lat, posicionUsuarioActual.lng],
        [objetoEstadioSeleccionado.latitud, objetoEstadioSeleccionado.longitud]
    ]);
    mapa.fitBounds(bounds, { padding: [50, 50] });
}

// Preparación de APIs url para compartir en Redes Sociales (WhatsApp y Facebook)
function configurarBotonesCompartir(equipo) {
    const textoMensaje = `¡Mira el estadio de los ${equipo.nombre} en ${equipo.ciudad}! Ubicación: https://www.google.com/maps?q=${equipo.latitud},${equipo.longitud}`;
    
    document.getElementById('share-ws').onclick = () => {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(textoMensaje)}`, '_blank');
    };

    document.getElementById('share-fb').onclick = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(textoMensaje)}`, '_blank');
    };
}