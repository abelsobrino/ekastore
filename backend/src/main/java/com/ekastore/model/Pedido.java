package com.ekastore.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "pedido", schema = "public")
public class Pedido {

    @Id
    @Column(name = "nro_pedido", length = 10)
    private String nroPedido;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(name = "dni_cliente", nullable = false, length = 8)
    private String dniCliente;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    @Column(nullable = false, length = 20)
    private String estado;

    @Column(name = "estado_pago", nullable = false, length = 20)
    private String estadoPago;

    @Column(name = "modalidad_entrega", nullable = false, length = 20)
    private String modalidadEntrega;

    public Pedido() {
    }

    public String getNroPedido() {
        return nroPedido;
    }

    public void setNroPedido(String valor) {
        nroPedido = valor;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate valor) {
        fecha = valor;
    }

    public String getDniCliente() {
        return dniCliente;
    }

    public void setDniCliente(String valor) {
        dniCliente = valor;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal valor) {
        total = valor;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String valor) {
        estado = valor;
    }

    public String getEstadoPago() {
        return estadoPago;
    }

    public void setEstadoPago(String valor) {
        estadoPago = valor;
    }

    public String getModalidadEntrega() {
        return modalidadEntrega;
    }

    public void setModalidadEntrega(String valor) {
        modalidadEntrega = valor;
    }
}