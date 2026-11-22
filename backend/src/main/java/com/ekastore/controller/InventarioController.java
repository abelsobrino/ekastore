package com.ekastore.controller;

import com.ekastore.dto.MovimientoInventarioRequest;
import com.ekastore.model.MovimientoInventario;
import com.ekastore.service.InventarioService;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventario")
public class InventarioController {

    private final InventarioService service;

    public InventarioController(InventarioService service) {
        this.service = service;
    }

    @GetMapping
    public List<InventarioService.InventarioResumen> listar() {
        return service.listar();
    }

    @GetMapping("/{codigo}/movimientos")
    public List<MovimientoInventario> historial(
            @PathVariable String codigo) {
        return service.historial(codigo);
    }

    @PostMapping("/{codigo}/movimientos")
    @ResponseStatus(HttpStatus.CREATED)
    public MovimientoInventario registrar(
            @PathVariable String codigo,
            @Valid @RequestBody MovimientoInventarioRequest datos) {

        return service.registrarMovimiento(codigo, datos);
    }
}