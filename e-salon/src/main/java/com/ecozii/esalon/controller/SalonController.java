package com.ecozii.esalon.controller;

import com.ecozii.esalon.dto.SalonLocationResponse;
import com.ecozii.esalon.model.Salon;
import com.ecozii.esalon.repository.SalonRepository;
import com.ecozii.esalon.service.MapsService;
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
    private final MapsService mapsService;

    @GetMapping
    public ResponseEntity<List<Salon>> getAllSalons() {
        return ResponseEntity.ok(salonRepository.findByIsActiveTrueOrderByRatingDesc());
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<SalonLocationResponse>> findNearbySalons(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(defaultValue = "5") Double radius,
            @RequestParam(required = false) Long serviceId,
            @RequestParam(required = false) String serviceName,
            @RequestParam(defaultValue = "nearest") String sort) {
        return ResponseEntity.ok(mapsService.findNearbySalons(
                latitude, longitude, radius, serviceId, serviceName, sort));
    }

    /** Kept for older clients; prefer GET /api/salons/nearby. */
    @PostMapping("/nearby")
    public ResponseEntity<List<SalonLocationResponse>> findNearbySalonsPost(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(defaultValue = "5") Double radiusKm,
            @RequestParam(required = false) Long serviceId,
            @RequestParam(required = false) String serviceName,
            @RequestParam(defaultValue = "nearest") String sort) {
        return ResponseEntity.ok(mapsService.findNearbySalons(
                latitude, longitude, radiusKm, serviceId, serviceName, sort));
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
}
