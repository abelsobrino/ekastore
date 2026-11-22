package com.ekastore.controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @GetMapping("/csrf")
    public Map<String, String> csrf(CsrfToken token) {
        return Map.of("token", token.getToken());
    }

    @GetMapping("/me")
    public Map<String, String> usuarioActual(
            Authentication authentication) {

        return Map.of(
                "usuario", authentication.getName());
    }
}