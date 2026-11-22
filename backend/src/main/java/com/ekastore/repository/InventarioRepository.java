package com.ekastore.repository;

import com.ekastore.model.Inventario;
import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface InventarioRepository
        extends JpaRepository<Inventario, String> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM Inventario i WHERE i.codigoProducto = :codigo")
    Optional<Inventario> buscarParaActualizar(
            @Param("codigo") String codigo);
}