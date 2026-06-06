class Equipo {
    constructor(id, nombre, pais, ciudad, historia, latitud, longitud, entrenador, patrocinadores) {
        this.id = id;
        this.nombre = nombre;
        this.pais = pais;
        this.ciudad = ciudad;
        this.historia = historia;
        this.latitud = latitud;
        this.longitud = longitud;
        this.entrenador = entrenador;
        this.patrocinadores = patrocinadores;
    }

    obtenerDetallesHtml() {
        return `<strong>Equipo:</strong> ${this.nombre}<br>
                <strong>Sede:</strong> ${this.ciudad}, ${this.pais}<br>
                <strong>Entrenador:</strong> ${this.entrenador}<br>
                <strong>Historia:</strong> ${this.historia}`;
    }
}