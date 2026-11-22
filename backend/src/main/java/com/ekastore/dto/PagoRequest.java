package com.ekastore.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record PagoRequest(

        @NotBlank String nroPedido,

        @NotNull @DecimalMin("0.01") @Digits(integer = 8, fraction = 2) BigDecimal monto,

        @NotBlank @Pattern(regexp = "EFECTIVO|YAPE|PLIN|TRANSFERENCIA|OTRO") String metodo

) {
}