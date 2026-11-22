package com.ekastore.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "inventario", schema = "public")
public class Inventario {

    @Id
    @Column(name = "codigo_producto", length = 10)
    private String codigoProducto;

    @Column(nullable = false)
    private int cantidad;

    @Column(name = "stock_minimo", nullable = false)
    private int stockMinimo;

    @Column(name = "fecha_actualizacion")
    private LocalDate fechaActualizacion;

    public Inventario() {
    }

    public Inventario(String codigoProducto) {
        this.codigoProducto = codigoProducto;
        this.cantidad = 0;
        this.stockMinimo = 0;
        this.fechaActualizacion = LocalDate.now();
    }

    public String getCodigoProducto() {
        return codigoProducto;
    }

    public int getCantidad() {
        return cantidad;
    }

    public void setCantidad(int cantidad) {
        this.cantidad = cantidad;
    }

    public int getStockMinimo() {
        return stockMinimo;
    }

    public void setStockMinimo(int stockMinimo) {
        this.stockMinimo = stockMinimo;
    }

    public LocalDate getFechaActualizacion() {
        return fechaActualizacion;
    }

    public void setFechaActualizacion(LocalDate fechaActualizacion) {
        this.fechaActualizacion = fechaActualizacion;
    }
}