package com.ekastore.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "producto", schema = "public")
public class Producto {

    @Id
    @Column(length = 10)
    private String codigo;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 200)
    private String descripcion;

    @Column(nullable = false, length = 50)
    private String marca;

    @Column(length = 50)
    private String categoria;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precio;

    @Column(name = "modalidad_disponibilidad", nullable = false, length = 20)
    private String modalidadDisponibilidad;

    public Producto() {
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getMarca() {
        return marca;
    }

    public void setMarca(String marca) {
        this.marca = marca;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public BigDecimal getPrecio() {
        return precio;
    }

    public void setPrecio(BigDecimal precio) {
        this.precio = precio;
    }

    public String getModalidadDisponibilidad() {
        return modalidadDisponibilidad;
    }

    public void setModalidadDisponibilidad(String modalidadDisponibilidad) {
        this.modalidadDisponibilidad = modalidadDisponibilidad;
    }
}