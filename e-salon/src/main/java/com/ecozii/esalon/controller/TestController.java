package com.ecozii.esalon.controller;

import com.ecozii.esalon.model.User;
import com.ecozii.esalon.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TestController {

    private final UserRepository userRepository;

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Ecozii E-Salon Backend is running! ✅");
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/users/count")
    public ResponseEntity<String> getUserCount() {
        long count = userRepository.count();
        return ResponseEntity.ok("Total users in database: " + count);
    }
}