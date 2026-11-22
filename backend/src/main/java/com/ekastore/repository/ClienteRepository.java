package com.ekastore.repository;

import com.ekastore.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClienteRepository
        extends JpaRepository<Cliente, String> {
}