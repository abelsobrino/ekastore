package com.ekastore.controller;

import com.ekastore.dto.EstadoPedidoRequest;
import com.ekastore.dto.PedidoRequest;
import com.ekastore.service.PedidoService;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoService service;

    public PedidoController(PedidoService service) {
        this.service = service;
    }

    @GetMapping
    public List<PedidoService.PedidoRespuesta> listar() {
        return service.listar();
    }

    @GetMapping("/{numero}")
    public PedidoService.PedidoRespuesta buscar(
            @PathVariable String numero) {
        return service.buscar(numero);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PedidoService.PedidoRespuesta registrar(
            @Valid @RequestBody PedidoRequest datos) {
        return service.registrar(datos);
    }

    @PutMapping("/{numero}/estado")
    public PedidoService.PedidoRespuesta cambiarEstado(
            @PathVariable String numero,
            @Valid @RequestBody EstadoPedidoRequest datos) {

        return service.cambiarEstado(numero, datos.estado());
    }
}