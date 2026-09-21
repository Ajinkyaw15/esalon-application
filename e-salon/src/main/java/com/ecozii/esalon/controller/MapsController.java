package com.ecozii.esalon.controller;

import com.ecozii.esalon.dto.SalonLocationResponse;
import com.ecozii.esalon.service.MapsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/maps")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MapsController {

    private final MapsService mapsService;

    // 1. Nearby salons by GPS
    @GetMapping("/nearby")
    public ResponseEntity<List<SalonLocationResponse>> nearbySalons(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(defaultValue = "5.0") Double radiusKm,
            @RequestParam(required = false) Long serviceId,
            @RequestParam(required = false) String serviceName,
            @RequestParam(defaultValue = "nearest") String sort) {
        return ResponseEntity.ok(
                mapsService.findNearbySalons(
                        latitude, longitude, radiusKm, serviceId, serviceName, sort));
    }

    // 2. Salons by city
    @GetMapping("/city/{city}")
    public ResponseEntity<List<SalonLocationResponse>> salonsByCity(
            @PathVariable String city) {
        return ResponseEntity.ok(mapsService.findSalonsByCity(city));
    }

    // 3. Directions between coordinates
    @GetMapping("/directions")
    public ResponseEntity<Map<String, String>> directions(
            @RequestParam Double fromLat,
            @RequestParam Double fromLng,
            @RequestParam Double toLat,
            @RequestParam Double toLng) {
        return ResponseEntity.ok(Map.of("directionsUrl",
                mapsService.getDirectionsUrl(
                        fromLat, fromLng, toLat, toLng)));
    }

    // 3b. Directions to salon
    @GetMapping("/directions/salon/{salonId}")
    public ResponseEntity<Map<String, String>> directionsToSalon(
            @PathVariable Long salonId,
            @RequestParam Double fromLat,
            @RequestParam Double fromLng) {
        return ResponseEntity.ok(Map.of("directionsUrl",
                mapsService.getDirectionsToSalon(fromLat, fromLng, salonId)));
    }

    // 4. Google Maps link for salon
    @GetMapping("/salon/{salonId}/link")
    public ResponseEntity<Map<String, String>> salonMapsLink(
            @PathVariable Long salonId) {
        return ResponseEntity.ok(Map.of(
                "salonId", salonId.toString(),
                "googleMapsUrl", mapsService.getSalonMapsUrl(salonId)));
    }
}