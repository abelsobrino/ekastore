package com.ekastore.repository;

import com.ekastore.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductoRepository
        extends JpaRepository<Producto, String> {
}