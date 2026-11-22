package com.ekastore.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

public record MovimientoInventarioRequest(

        @NotBlank @Pattern(regexp = "ENTRADA|SALIDA") String tipo,

        @NotNull @Min(1) Integer cantidad,

        @Size(max = 100) String motivo,

        LocalDate fechaVencimiento

) {
}