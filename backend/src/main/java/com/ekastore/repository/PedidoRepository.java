package com.ekastore.repository;

import com.ekastore.model.Pedido;
import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PedidoRepository
                extends JpaRepository<Pedido, String> {

        @Lock(LockModeType.PESSIMISTIC_WRITE)
        @Query("SELECT p FROM Pedido p WHERE p.nroPedido = :numero")
        Optional<Pedido> buscarParaActualizar(
                        @Param("numero") String numero);
}