package com.ekastore.controller;

import com.ekastore.dto.ClienteRequest;
import com.ekastore.model.Cliente;
import com.ekastore.service.ClienteService;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    private final ClienteService service;

    public ClienteController(ClienteService service) {
        this.service = service;
    }

    @GetMapping
    public List<Cliente> listar() {
        return service.listar();
    }

    @GetMapping("/{dni}")
    public Cliente buscar(@PathVariable String dni) {
        return service.buscar(dni);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Cliente registrar(
            @Valid @RequestBody ClienteRequest datos) {

        return service.registrar(datos);
    }

    @PutMapping("/{dni}")
    public Cliente actualizar(
            @PathVariable String dni,
            @Valid @RequestBody ClienteRequest datos) {

        return service.actualizar(dni, datos);
    }
}