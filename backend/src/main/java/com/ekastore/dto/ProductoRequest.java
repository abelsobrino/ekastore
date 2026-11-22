package com.ekastore.dto;

import java.math.BigDecimal;
import jakarta.validation.constraints.*;

public record ProductoRequest(

        @NotBlank @Size(max = 10) String codigo,

        @NotBlank @Size(max = 100) String nombre,

        @Size(max = 200) String descripcion,

        @NotBlank @Size(max = 50) String marca,

        @Size(max = 50) String categoria,

        @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal precio,

        @NotBlank @Pattern(regexp = "EN_STOCK|BAJO_PEDIDO") String modalidadDisponibilidad

) {
}