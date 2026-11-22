package com.ekastore.dto;

import jakarta.validation.constraints.*;

public record ClienteRequest(

        @NotBlank @Pattern(regexp = "[0-9]{8}", message = "El DNI debe contener 8 digitos") String dni,

        @NotBlank @Size(max = 100) String nombre,

        @Size(max = 15) String telefono,

        @Size(max = 200) String direccion,

        @Email @Size(max = 100) String email

) {
}