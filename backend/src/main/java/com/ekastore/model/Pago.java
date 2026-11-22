package com.ekastore.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "pago", schema = "public")
public class Pago {

    @Id
    @Column(name = "nro_pago", length = 10)
    private String nroPago;

    @Column(name = "nro_pedido", nullable = false, length = 10)
    private String nroPedido;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal monto;

    @Column(nullable = false, length = 20)
    private String metodo;

    public Pago() {
    }

    public String getNroPago() {
        return nroPago;
    }

    public void setNroPago(String nroPago) {
        this.nroPago = nroPago;
    }

    public String getNroPedido() {
        return nroPedido;
    }

    public void setNroPedido(String nroPedido) {
        this.nroPedido = nroPedido;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public BigDecimal getMonto() {
        return monto;
    }

    public void setMonto(BigDecimal monto) {
        this.monto = monto;
    }

    public String getMetodo() {
        return metodo;
    }

    public void setMetodo(String metodo) {
        this.metodo = metodo;
    }
}