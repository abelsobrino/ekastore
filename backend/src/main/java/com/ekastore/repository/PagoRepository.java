package com.ekastore.repository;

import com.ekastore.model.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PagoRepository
        extends JpaRepository<Pago, String> {

    List<Pago> findByNroPedidoOrderByFechaDesc(
            String nroPedido);
}