package com.ekastore.service;

import com.ekastore.dto.MovimientoInventarioRequest;
import com.ekastore.model.Inventario;
import com.ekastore.model.MovimientoInventario;
import com.ekastore.repository.InventarioRepository;
import com.ekastore.repository.MovimientoInventarioRepository;
import com.ekastore.repository.ProductoRepository;

import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class InventarioService {

    private final InventarioRepository inventarios;
    private final MovimientoInventarioRepository movimientos;
    private final ProductoRepository productos;

    public InventarioService(
            InventarioRepository inventarios,
            MovimientoInventarioRepository movimientos,
            ProductoRepository productos) {

        this.inventarios = inventarios;
        this.movimientos = movimientos;
        this.productos = productos;
    }

    public record InventarioResumen(
            String codigoProducto,
            String nombre,
            String marca,
            int cantidad,
            int stockMinimo,
            LocalDate fechaActualizacion) {
    }

    @Transactional(readOnly = true)
    public List<InventarioResumen> listar() {

        Map<String, Inventario> stock = inventarios.findAll()
                .stream()
                .collect(Collectors.toMap(
                        Inventario::getCodigoProducto,
                        Function.identity()));

        return productos.findAll(Sort.by("nombre"))
                .stream()
                .map(producto -> {
                    Inventario i = stock.get(producto.getCodigo());

                    return new InventarioResumen(
                            producto.getCodigo(),
                            producto.getNombre(),
                            producto.getMarca(),
                            i == null ? 0 : i.getCantidad(),
                            i == null ? 0 : i.getStockMinimo(),
                            i == null ? null : i.getFechaActualizacion());
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MovimientoInventario> historial(String codigo) {

        if (!productos.existsById(codigo)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Producto no encontrado");
        }

        return movimientos.findByCodigoProductoOrderByFechaDesc(
                codigo);
    }

    @Transactional
    public MovimientoInventario registrarMovimiento(
            String codigo,
            MovimientoInventarioRequest datos) {

        if (!productos.existsById(codigo)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Producto no encontrado");
        }

        Inventario inventario = inventarios
                .buscarParaActualizar(codigo)
                .orElseGet(() -> inventarios.saveAndFlush(new Inventario(codigo)));

        int stockActual = inventario.getCantidad();
        int cantidad = datos.cantidad();

        int nuevoStock;

        if (datos.tipo().equals("ENTRADA")) {
            nuevoStock = Math.addExact(stockActual, cantidad);
        } else {
            if (cantidad > stockActual) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Stock insuficiente");
            }

            nuevoStock = stockActual - cantidad;
        }

        inventario.setCantidad(nuevoStock);
        inventario.setFechaActualizacion(LocalDate.now());

        inventarios.save(inventario);

        MovimientoInventario movimiento = new MovimientoInventario(
                codigo,
                datos.tipo(),
                cantidad,
                datos.motivo(),
                datos.fechaVencimiento());

        return movimientos.save(movimiento);
    }
}