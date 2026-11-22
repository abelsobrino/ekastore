package com.ekastore.service;

import com.ekastore.dto.PedidoRequest;
import com.ekastore.model.*;
import com.ekastore.repository.*;

import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Service
public class PedidoService {

    private final PedidoRepository pedidos;
    private final DetallePedidoRepository detalles;
    private final ClienteRepository clientes;
    private final ProductoRepository productos;
    private final InventarioRepository inventarios;
    private final MovimientoInventarioRepository movimientos;

    public PedidoService(
            PedidoRepository pedidos,
            DetallePedidoRepository detalles,
            ClienteRepository clientes,
            ProductoRepository productos,
            InventarioRepository inventarios,
            MovimientoInventarioRepository movimientos) {

        this.pedidos = pedidos;
        this.detalles = detalles;
        this.clientes = clientes;
        this.productos = productos;
        this.inventarios = inventarios;
        this.movimientos = movimientos;
    }

    public record LineaRespuesta(
            String codigoProducto,
            String nombreProducto,
            int cantidad,
            BigDecimal precioUnitario,
            BigDecimal subtotal) {
    }

    public record PedidoRespuesta(
            String nroPedido,
            LocalDate fecha,
            String dniCliente,
            String nombreCliente,
            BigDecimal total,
            String estado,
            String estadoPago,
            String modalidadEntrega,
            List<LineaRespuesta> detalles) {
    }

    @Transactional(readOnly = true)
    public List<PedidoRespuesta> listar() {
        return pedidos.findAll(
                Sort.by(Sort.Direction.DESC, "fecha", "nroPedido")).stream().map(this::respuesta).toList();
    }

    @Transactional(readOnly = true)
    public PedidoRespuesta buscar(String numero) {
        return respuesta(obtenerPedido(numero));
    }

    private Pedido obtenerPedido(String numero) {
        return pedidos.findById(numero).orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Pedido no encontrado"));
    }

    @Transactional
    public PedidoRespuesta registrar(PedidoRequest datos) {

        if (!clientes.existsById(datos.dniCliente())) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Cliente no encontrado");
        }

        Set<String> codigos = new HashSet<>();
        List<Producto> listaProductos = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;
        boolean faltaStock = false;

        // Validar productos y calcular el total
        for (PedidoRequest.Linea linea : datos.detalles()) {

            if (!codigos.add(linea.codigoProducto())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "No repitas un producto en el mismo pedido");
            }

            Producto producto = productos
                    .findById(linea.codigoProducto())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Producto no encontrado: "
                                    + linea.codigoProducto()));

            listaProductos.add(producto);

            BigDecimal subtotal = producto.getPrecio()
                    .multiply(BigDecimal.valueOf(linea.cantidad()));

            total = total.add(subtotal);

            int disponibles = inventarios
                    .findById(producto.getCodigo())
                    .map(Inventario::getCantidad)
                    .orElse(0);

            if (disponibles < linea.cantidad()) {
                faltaStock = true;
            }
        }

        if (total.compareTo(new BigDecimal("99999999.99")) > 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El total supera el monto permitido");
        }

        String numero = "PD" + UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 8)
                .toUpperCase();

        Pedido pedido = new Pedido();
        pedido.setNroPedido(numero);
        pedido.setFecha(LocalDate.now());
        pedido.setDniCliente(datos.dniCliente());
        pedido.setTotal(total);
        pedido.setEstado(
                faltaStock ? "PENDIENTE_DE_STOCK" : "PENDIENTE");
        pedido.setEstadoPago("PENDIENTE");
        pedido.setModalidadEntrega(datos.modalidadEntrega());

        pedidos.save(pedido);

        List<DetallePedido> lineas = new ArrayList<>();

        for (int i = 0; i < datos.detalles().size(); i++) {
            PedidoRequest.Linea datosLinea = datos.detalles().get(i);
            Producto producto = listaProductos.get(i);

            lineas.add(new DetallePedido(
                    numero,
                    producto.getCodigo(),
                    datosLinea.cantidad(),
                    producto.getPrecio()));
        }

        detalles.saveAll(lineas);

        return respuesta(pedido);
    }

    @Transactional
    public PedidoRespuesta cambiarEstado(
            String numero,
            String nuevoEstado) {

        Pedido pedido = pedidos.buscarParaActualizar(numero)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Pedido no encontrado"));
        String actual = pedido.getEstado();

        if (actual.equals(nuevoEstado)) {
            return respuesta(pedido);
        }

        switch (nuevoEstado) {

            case "ACUMULADO" -> {
                if (!actual.equals("PENDIENTE")
                        && !actual.equals("PENDIENTE_DE_STOCK")) {
                    estadoInvalido();
                }
            }

            case "EN_PROCESO" -> {
                if (!actual.equals("PENDIENTE")
                        && !actual.equals("PENDIENTE_DE_STOCK")
                        && !actual.equals("ACUMULADO")) {
                    estadoInvalido();
                }

                descontarInventario(pedido);
            }

            case "ENVIADO" -> {
                if (!actual.equals("EN_PROCESO")) {
                    estadoInvalido();
                }
            }

            case "ENTREGADO" -> {
                boolean enviado = actual.equals("ENVIADO");
                boolean entregaLocal = actual.equals("EN_PROCESO")
                        && pedido.getModalidadEntrega()
                                .equals("ENTREGA_LOCAL");

                if (!enviado && !entregaLocal) {
                    estadoInvalido();
                }
            }

            default -> estadoInvalido();
        }

        pedido.setEstado(nuevoEstado);
        pedidos.save(pedido);

        return respuesta(pedido);
    }

    private void estadoInvalido() {
        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Cambio de estado no permitido");
    }

    private void descontarInventario(Pedido pedido) {

        List<DetallePedido> lineas = new ArrayList<>(
                detalles.findByIdNroPedido(pedido.getNroPedido()));

        // Bloquear siempre en el mismo orden
        lineas.sort(Comparator.comparing(
                d -> d.getId().getCodigoProducto()));

        for (DetallePedido linea : lineas) {
            String codigo = linea.getId().getCodigoProducto();

            Inventario inventario = inventarios
                    .buscarParaActualizar(codigo)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.CONFLICT,
                            "No existe inventario para " + codigo));

            if (inventario.getCantidad() < linea.getCantidad()) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Stock insuficiente para " + codigo);
            }

            inventario.setCantidad(
                    inventario.getCantidad() - linea.getCantidad());
            inventario.setFechaActualizacion(LocalDate.now());

            inventarios.save(inventario);

            movimientos.save(new MovimientoInventario(
                    codigo,
                    "SALIDA",
                    linea.getCantidad(),
                    "Pedido " + pedido.getNroPedido(),
                    null));
        }
    }

    private PedidoRespuesta respuesta(Pedido pedido) {

        String nombreCliente = clientes
                .findById(pedido.getDniCliente())
                .map(Cliente::getNombre)
                .orElse("Cliente no encontrado");

        List<LineaRespuesta> lineas = detalles
                .findByIdNroPedido(pedido.getNroPedido())
                .stream()
                .map(detalle -> {
                    String codigo = detalle.getId().getCodigoProducto();

                    String nombreProducto = productos
                            .findById(codigo)
                            .map(Producto::getNombre)
                            .orElse("Producto no encontrado");

                    return new LineaRespuesta(
                            codigo,
                            nombreProducto,
                            detalle.getCantidad(),
                            detalle.getPrecioUnitario(),
                            detalle.getSubtotal());
                })
                .toList();

        return new PedidoRespuesta(
                pedido.getNroPedido(),
                pedido.getFecha(),
                pedido.getDniCliente(),
                nombreCliente,
                pedido.getTotal(),
                pedido.getEstado(),
                pedido.getEstadoPago(),
                pedido.getModalidadEntrega(),
                lineas);
    }
}