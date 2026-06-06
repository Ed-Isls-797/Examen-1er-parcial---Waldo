class EquiposBaskquet extends Equipo {
    constructor(id, nombre, pais, ciudad, historia, latitud, longitud, entrenador, patrocinadores, jugadoresPro, ventajas, desventajas) {
        super(id, nombre, pais, ciudad, historia, latitud, longitud, entrenador, patrocinadores);
        this.jugadoresPro = jugadoresPro;
        this.ventajas = ventajas;
        this.desventajas = desventajas;
    }
}