package com.ekastore.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

public record PedidoRequest(

        @NotBlank String dniCliente,

        @NotBlank @Pattern(regexp = "ENVIO_NACIONAL|ENTREGA_LOCAL") String modalidadEntrega,

        @NotEmpty List<@Valid Linea> detalles

) {
    public record Linea(
            @NotBlank String codigoProducto,
            @NotNull @Min(1) Integer cantidad) {
    }
}