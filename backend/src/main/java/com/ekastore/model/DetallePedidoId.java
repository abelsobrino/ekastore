package com.ekastore.model;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class DetallePedidoId implements Serializable {

    @Column(name = "nro_pedido", length = 10)
    private String nroPedido;

    @Column(name = "codigo_producto", length = 10)
    private String codigoProducto;

    public DetallePedidoId() {
    }

    public DetallePedidoId(String nroPedido, String codigoProducto) {
        this.nroPedido = nroPedido;
        this.codigoProducto = codigoProducto;
    }

    public String getNroPedido() {
        return nroPedido;
    }

    public String getCodigoProducto() {
        return codigoProducto;
    }

    @Override
    public boolean equals(Object objeto) {
        if (this == objeto)
            return true;
        if (!(objeto instanceof DetallePedidoId otro))
            return false;

        return Objects.equals(nroPedido, otro.nroPedido)
                && Objects.equals(codigoProducto, otro.codigoProducto);
    }

    @Override
    public int hashCode() {
        return Objects.hash(nroPedido, codigoProducto);
    }
}