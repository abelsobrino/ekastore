package com.ekastore.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "detalle_pedido", schema = "public")
public class DetallePedido {

    @EmbeddedId
    private DetallePedidoId id;

    @Column(nullable = false)
    private int cantidad;

    @Column(name = "precio_unitario", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioUnitario;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    public DetallePedido() {
    }

    public DetallePedido(
            String nroPedido,
            String codigoProducto,
            int cantidad,
            BigDecimal precioUnitario) {

        this.id = new DetallePedidoId(nroPedido, codigoProducto);
        this.cantidad = cantidad;
        this.precioUnitario = precioUnitario;
        this.subtotal = precioUnitario.multiply(
                BigDecimal.valueOf(cantidad));
    }

    public DetallePedidoId getId() {
        return id;
    }

    public int getCantidad() {
        return cantidad;
    }

    public BigDecimal getPrecioUnitario() {
        return precioUnitario;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }
}