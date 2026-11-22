package com.ekastore.controller;

import com.ekastore.dto.PagoRequest;
import com.ekastore.model.Pago;
import com.ekastore.service.PagoService;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pagos")
public class PagoController {

    private final PagoService service;

    public PagoController(PagoService service) {
        this.service = service;
    }

    @GetMapping
    public List<Pago> listar() {
        return service.listar();
    }

    @GetMapping("/pedido/{numero}")
    public List<Pago> listarPorPedido(
            @PathVariable String numero) {

        return service.listarPorPedido(numero);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Pago registrar(
            @Valid @RequestBody PagoRequest datos) {

        return service.registrar(datos);
    }
}