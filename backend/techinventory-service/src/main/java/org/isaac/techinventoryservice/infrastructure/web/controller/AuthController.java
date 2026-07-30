package org.isaac.techinventoryservice.infrastructure.web.controller;

import jakarta.validation.Valid;
import org.isaac.techinventoryservice.infrastructure.security.Role;
import org.isaac.techinventoryservice.infrastructure.security.jwt.JwtService;
import org.isaac.techinventoryservice.infrastructure.web.dto.request.LoginRequest;
import org.isaac.techinventoryservice.infrastructure.web.dto.response.LoginResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(JwtService jwtService, PasswordEncoder passwordEncoder) {
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody @Valid LoginRequest request) {
        if (!"admin".equals(request.username()) && !"user".equals(request.username())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "status", 401,
                            "message", "Credenciales inválidas"
                    ));
        }

        String expectedPassword = "admin".equals(request.username()) ? "admin123" : "user123";
        Role role = "admin".equals(request.username()) ? Role.ADMIN : Role.USER;

        if (!passwordEncoder.matches(request.password(), passwordEncoder.encode(expectedPassword))) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "status", 401,
                            "message", "Credenciales inválidas"
                    ));
        }

        String token = jwtService.generateToken(request.username(), role.name());

        return ResponseEntity.status(HttpStatus.OK)
                .body(Map.of(
                        "status", 200,
                        "message", "Autenticación exitosa",
                        "data", new LoginResponse(token, "Bearer")
                ));
    }
}
