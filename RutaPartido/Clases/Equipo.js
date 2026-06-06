class Equipo {
    constructor(id, nombre, pais, city, historia, latitud, longitud, entrenador, patrocinadores) {
        this.id = id;
        this.nombre = nombre;
        this.pais = pais;
        this.ciudad = city;
        this.historia = historia;
        this.latitud = latitud;
        this.longitud = longitud;
        this.entrenador = entrenador;
        this.patrocinadores = patrocinadores;
    }

    obtenerDetallesHtml() {
        // Formateamos los patrocinadores como una lista separada por comas
        const listaPatrocinadores = this.patrocinadores && this.patrocinadores.length > 0 
            ? this.patrocinadores.join(', ') 
            : 'No disponible';

        return `<strong>Equipo:</strong> ${this.nombre}<br>
                <strong>Sede:</strong> ${this.ciudad}, ${this.pais}<br>
                <strong>Entrenador:</strong> ${this.entrenador}<br>
                <strong>Patrocinadores:</strong> ${listaPatrocinadores}<br>
                <strong>Historia:</strong> ${this.historia}`;
    }
}