package com.ekastore.service;

import com.ekastore.dto.ClienteRequest;
import com.ekastore.model.Cliente;
import com.ekastore.repository.ClienteRepository;

import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ClienteService {

    private final ClienteRepository repository;

    public ClienteService(ClienteRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<Cliente> listar() {
        return repository.findAll(
                Sort.by("nombre").ascending());
    }

    @Transactional(readOnly = true)
    public Cliente buscar(String dni) {
        return repository.findById(dni)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Cliente no encontrado"));
    }

    @Transactional
    public Cliente registrar(ClienteRequest datos) {

        if (repository.existsById(datos.dni())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El DNI ya esta registrado");
        }

        Cliente cliente = new Cliente();
        cliente.setDni(datos.dni());

        copiarDatos(cliente, datos);

        return repository.save(cliente);
    }

    @Transactional
    public Cliente actualizar(
            String dni,
            ClienteRequest datos) {

        if (!dni.equals(datos.dni())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No se puede modificar el DNI");
        }

        Cliente cliente = buscar(dni);

        copiarDatos(cliente, datos);

        return repository.save(cliente);
    }

    private void copiarDatos(
            Cliente cliente,
            ClienteRequest datos) {

        cliente.setNombre(datos.nombre());
        cliente.setTelefono(datos.telefono());
        cliente.setDireccion(datos.direccion());
        cliente.setEmail(datos.email());
    }
}