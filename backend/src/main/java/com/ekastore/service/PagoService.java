package com.ekastore.service;

import com.ekastore.dto.PagoRequest;
import com.ekastore.model.Pago;
import com.ekastore.model.Pedido;
import com.ekastore.repository.PagoRepository;
import com.ekastore.repository.PedidoRepository;

import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class PagoService {

    private final PagoRepository pagos;
    private final PedidoRepository pedidos;

    public PagoService(
            PagoRepository pagos,
            PedidoRepository pedidos) {

        this.pagos = pagos;
        this.pedidos = pedidos;
    }

    @Transactional(readOnly = true)
    public List<Pago> listar() {
        return pagos.findAll(
                Sort.by(
                        Sort.Direction.DESC,
                        "fecha",
                        "nroPago"));
    }

    @Transactional(readOnly = true)
    public List<Pago> listarPorPedido(String numero) {

        if (!pedidos.existsById(numero)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Pedido no encontrado");
        }

        return pagos.findByNroPedidoOrderByFechaDesc(numero);
    }

    @Transactional
    public Pago registrar(PagoRequest datos) {

        // Bloquear pedido para evitar pagos simultáneos
        Pedido pedido = pedidos
                .buscarParaActualizar(datos.nroPedido())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Pedido no encontrado"));

        // Calcular pagos registrados
        List<Pago> anteriores = pagos.findByNroPedidoOrderByFechaDesc(
                datos.nroPedido());

        BigDecimal pagado = anteriores.stream()
                .map(Pago::getMonto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal saldo = pedido.getTotal()
                .subtract(pagado);

        // Impedir pagos duplicados o superiores al saldo
        if (saldo.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El pedido ya esta pagado");
        }

        if (datos.monto().compareTo(saldo) > 0) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El monto supera el saldo pendiente");
        }

        // Registrar pago
        Pago pago = new Pago();

        String numero = "PG" + UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 8)
                .toUpperCase();

        pago.setNroPago(numero);
        pago.setNroPedido(datos.nroPedido());
        pago.setFecha(LocalDate.now());
        pago.setMonto(datos.monto());
        pago.setMetodo(datos.metodo());

        pagos.save(pago);

        // Actualizar estado del pedido
        BigDecimal nuevoTotalPagado = pagado.add(datos.monto());

        if (nuevoTotalPagado.compareTo(pedido.getTotal()) == 0) {
            pedido.setEstadoPago("PAGADO");
        } else {
            pedido.setEstadoPago("PARCIAL");
        }

        pedidos.save(pedido);

        return pago;
    }
}