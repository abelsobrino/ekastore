package com.ekastore.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "movimiento_inventario", schema = "public")
public class MovimientoInventario {

    @Id
    @Column(name = "nro_movimiento", length = 10)
    private String nroMovimiento;

    @Column(name = "codigo_producto", nullable = false)
    private String codigoProducto;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(nullable = false, length = 10)
    private String tipo;

    @Column(nullable = false)
    private int cantidad;

    @Column(length = 100)
    private String motivo;

    @Column(name = "fecha_vencimiento")
    private LocalDate fechaVencimiento;

    public MovimientoInventario() {
    }

    public MovimientoInventario(
            String codigoProducto,
            String tipo,
            int cantidad,
            String motivo,
            LocalDate fechaVencimiento) {

        this.nroMovimiento = "M" + UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 9)
                .toUpperCase();

        this.codigoProducto = codigoProducto;
        this.fecha = LocalDate.now();
        this.tipo = tipo;
        this.cantidad = cantidad;
        this.motivo = motivo;
        this.fechaVencimiento = fechaVencimiento;
    }

    public String getNroMovimiento() {
        return nroMovimiento;
    }

    public String getCodigoProducto() {
        return codigoProducto;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public String getTipo() {
        return tipo;
    }

    public int getCantidad() {
        return cantidad;
    }

    public String getMotivo() {
        return motivo;
    }

    public LocalDate getFechaVencimiento() {
        return fechaVencimiento;
    }
}