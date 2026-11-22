package com.ekastore.controller;

import com.ekastore.dto.ProductoRequest;
import com.ekastore.model.Producto;
import com.ekastore.service.ProductoService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private final ProductoService service;

    public ProductoController(ProductoService service) {
        this.service = service;
    }

    @GetMapping
    public List<Producto> listar() {
        return service.listar();
    }

    @GetMapping("/{codigo}")
    public Producto buscar(@PathVariable String codigo) {
        return service.buscar(codigo);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Producto registrar(
            @Valid @RequestBody ProductoRequest datos) {

        return service.registrar(datos);
    }

    @PutMapping("/{codigo}")
    public Producto actualizar(
            @PathVariable String codigo,
            @Valid @RequestBody ProductoRequest datos) {

        return service.actualizar(codigo, datos);
    }
}