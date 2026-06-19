package com.ecozii.esalon.controller;

import com.ecozii.esalon.model.Service;
import com.ecozii.esalon.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ServiceController {

    private final ServiceRepository serviceRepository;

    @GetMapping
    public ResponseEntity<List<Service>> getAllServices() {
        return ResponseEntity.ok(serviceRepository.findByIsActiveTrueOrderByNameAsc());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Service> getServiceById(@PathVariable Long id) {
        return serviceRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Service>> getServicesByCategory(@PathVariable String category) {
        return ResponseEntity.ok(serviceRepository.findByCategoryAndIsActiveTrue(category));
    }

    @GetMapping("/salon/{salonId}")
    public ResponseEntity<List<Service>> getServicesBySalon(@PathVariable Long salonId) {
        return ResponseEntity.ok(serviceRepository.findBySalonIdAndIsActiveTrue(salonId));
    }
}