package com.ekastore.repository;

import com.ekastore.model.DetallePedido;
import com.ekastore.model.DetallePedidoId;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DetallePedidoRepository
        extends JpaRepository<DetallePedido, DetallePedidoId> {

    List<DetallePedido> findByIdNroPedido(String nroPedido);
}