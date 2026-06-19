package com.ecozii.esalon.controller;

import com.ecozii.esalon.model.Salon;
import com.ecozii.esalon.repository.SalonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/salons")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SalonController {

    private final SalonRepository salonRepository;

    @GetMapping
    public ResponseEntity<List<Salon>> getAllSalons() {
        return ResponseEntity.ok(salonRepository.findByIsActiveTrueOrderByRatingDesc());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Salon> getSalonById(@PathVariable Long id) {
        return salonRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/city/{city}")
    public ResponseEntity<List<Salon>> getSalonsByCity(@PathVariable String city) {
        return ResponseEntity.ok(salonRepository.findByCityAndIsActiveTrue(city));
    }

    @PostMapping("/nearby")
    public ResponseEntity<List<Salon>> findNearbySalons(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(defaultValue = "10") Double radiusKm) {

        List<Salon> salons = salonRepository.findNearbySalonsSortedByRating(
                latitude, longitude, radiusKm
        );
        return ResponseEntity.ok(salons);
    }
}