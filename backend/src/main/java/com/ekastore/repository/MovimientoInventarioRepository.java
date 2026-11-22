package com.ekastore.repository;

import com.ekastore.model.MovimientoInventario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MovimientoInventarioRepository
        extends JpaRepository<MovimientoInventario, String> {

    List<MovimientoInventario> findByCodigoProductoOrderByFechaDesc(
            String codigoProducto);
}