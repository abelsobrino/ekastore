
package com.ekastore.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;

@Configuration
public class SeguridadConfig {

        @Bean
        public SecurityFilterChain securityFilterChain(
                        HttpSecurity http) throws Exception {

                http
                                // Proteccion contra ataques CSRF
                                .csrf(csrf -> csrf
                                                .csrfTokenRequestHandler(
                                                                new CsrfTokenRequestAttributeHandler()))

                                // Autenticacion mediante sesiones
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(
                                                                SessionCreationPolicy.IF_REQUIRED))

                                // Rutas publicas y protegidas
                                .authorizeHttpRequests(auth -> auth

                                                // Permitir cargar la interfaz React
                                                .requestMatchers(
                                                                "/",
                                                                "/index.html",
                                                                "/favicon.svg",
                                                                "/favicon.ico",
                                                                "/assets/**")
                                                .permitAll()

                                                // Permitir solicitar token e iniciar sesion
                                                .requestMatchers(
                                                                "/api/auth/csrf",
                                                                "/api/auth/login")
                                                .permitAll()

                                                // Proteger todas las demas rutas
                                                .anyRequest().authenticated())

                                // Inicio de sesion
                                .formLogin(form -> form
                                                .loginProcessingUrl("/api/auth/login")

                                                .successHandler((request, response, auth) -> response.setStatus(204))

                                                .failureHandler((request, response, error) -> response.sendError(401))

                                                .permitAll())

                                // Cierre de sesion
                                .logout(logout -> logout
                                                .logoutUrl("/api/auth/logout")

                                                .logoutSuccessHandler(
                                                                (request, response, auth) -> response.setStatus(204))

                                                .deleteCookies("JSESSIONID"))

                                // Respuesta cuando no existe una sesion valida
                                .exceptionHandling(ex -> ex
                                                .authenticationEntryPoint(
                                                                (request, response, error) -> response.sendError(401)))

                                // Desactivar autenticacion HTTP Basic
                                .httpBasic(AbstractHttpConfigurer::disable);

                return http.build();
        }

        // Cifrado seguro de contraseñas
        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        // Usuario administrador
        @Bean
        public UserDetailsService usuarios(
                        @Value("${APP_USER}") String usuario,
                        @Value("${APP_PASSWORD}") String clave,
                        PasswordEncoder encoder) {

                return new InMemoryUserDetailsManager(
                                User.withUsername(usuario)
                                                .password(encoder.encode(clave))
                                                .roles("ADMIN")
                                                .build());
        }
}
