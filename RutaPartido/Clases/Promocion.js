class Promocion {
    constructor(id_equipo, equipo, promocion, descripcion, patrocinador_asociado, descuento_beneficio) {
        this.id_equipo = id_equipo;
        this.equipo = equipo;
        this.promocion = promocion;
        this.descripcion = descripcion;
        this.patrocinador_asociado = patrocinador_asociado;
        this.descuento_beneficio = descuento_beneficio;
    }

    obtenerPromoHtml() {
        return `<strong>${this.promocion}</strong><br>
                <p>${this.descripcion}</p>
                <strong>Beneficio:</strong> ${this.descuento_beneficio}<br>
                <small>Vía: ${this.patrocinador_asociado}</small>`;
    }
}