package com.drawingapp.controller;

import com.drawingapp.dto.LoginRequest;
import com.drawingapp.dto.LoginResponse;
import com.drawingapp.dto.UserDto;
import com.drawingapp.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            UserDto user = authService.authenticate(loginRequest.getUsername(), loginRequest.getPassword());
            return ResponseEntity.ok(new LoginResponse(true, user));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(new LoginResponse(false, e.getMessage()));
        }
    }
}
