package com.ekastore.dto;

import jakarta.validation.constraints.*;

public record EstadoPedidoRequest(

        @NotBlank @Pattern(regexp = "ACUMULADO|EN_PROCESO|ENVIADO|ENTREGADO") String estado

) {
}