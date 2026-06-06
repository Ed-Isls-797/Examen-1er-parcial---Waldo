class EquiposAmericano extends Equipo {
    constructor(id, nombre, pais, ciudad, historia, latitud, longitud, entrenador, patrocinadores, jugadoresPro, ventajas, desventajas) {
        super(id, nombre, pais, ciudad, historia, latitud, longitud, entrenador, patrocinadores);
        this.jugadoresPro = jugadoresPro || [];
        this.ventajas = ventajas || [];
        this.desventajas = desventajas || [];
    }

    obtenerDetallesHtml() {
        // Obtenemos primero los datos genéricos del padre
        let html = super.obtenerDetallesHtml();

        // Concatenamos las listas específicas
        html += `<br><br><strong>Jugadores Pro:</strong><br>• ${this.jugadoresPro.join('<br>• ')}`;
        html += `<br><br><span style="color: #2ecc71;"><strong>Ventajas:</strong></span><br>• ${this.ventajas.join('<br>• ')}`;
        html += `<br><br><span style="color: #e74c3c;"><strong>Desventajas:</strong></span><br>• ${this.desventajas.join('<br>• ')}`;

        return html;
    }
}