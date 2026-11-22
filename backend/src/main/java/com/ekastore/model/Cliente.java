package com.ekastore.model;

import jakarta.persistence.*;

@Entity
@Table(name = "cliente", schema = "public")
public class Cliente {

    @Id
    @Column(length = 8)
    private String dni;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 15)
    private String telefono;

    @Column(length = 200)
    private String direccion;

    @Column(length = 100)
    private String email;

    public Cliente() {
    }

    public String getDni() {
        return dni;
    }

    public void setDni(String dni) {
        this.dni = dni;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}