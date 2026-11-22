package com.ekastore.service;

import com.ekastore.dto.ProductoRequest;
import com.ekastore.model.Producto;
import com.ekastore.repository.ProductoRepository;

import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ProductoService {

    private final ProductoRepository repository;

    public ProductoService(ProductoRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<Producto> listar() {
        return repository.findAll(
                Sort.by("nombre").ascending());
    }

    @Transactional(readOnly = true)
    public Producto buscar(String codigo) {
        return repository.findById(codigo)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Producto no encontrado"));
    }

    @Transactional
    public Producto registrar(ProductoRequest datos) {

        if (repository.existsById(datos.codigo())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El codigo ya existe");
        }

        Producto producto = new Producto();

        copiarDatos(producto, datos);
        producto.setCodigo(datos.codigo());

        return repository.save(producto);
    }

    @Transactional
    public Producto actualizar(
            String codigo,
            ProductoRequest datos) {

        if (!codigo.equals(datos.codigo())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No se puede cambiar el codigo");
        }

        Producto producto = buscar(codigo);

        copiarDatos(producto, datos);

        return repository.save(producto);
    }

    private void copiarDatos(
            Producto producto,
            ProductoRequest datos) {

        producto.setNombre(datos.nombre());
        producto.setDescripcion(datos.descripcion());
        producto.setMarca(datos.marca());
        producto.setCategoria(datos.categoria());
        producto.setPrecio(datos.precio());
        producto.setModalidadDisponibilidad(
                datos.modalidadDisponibilidad());
    }
}
