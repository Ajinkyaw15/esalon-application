package com.ecozii.esalon.service;

import com.ecozii.esalon.dto.SalonLocationResponse;
import com.ecozii.esalon.model.Salon;
import com.ecozii.esalon.repository.SalonRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MapsService {

    private final SalonRepository salonRepository;

    // 1. Find nearby salons by GPS
    public List<SalonLocationResponse> findNearbySalons(
            Double latitude, Double longitude, Double radiusKm) {

        return salonRepository.findAll().stream()
                .filter(salon -> Boolean.TRUE.equals(salon.getIsActive()))
                .map(salon -> {
                    double distance = calculateDistance(
                            latitude, longitude,
                            salon.getLatitude(), salon.getLongitude());
                    return buildLocationResponse(salon, distance);
                })
                .filter(s -> s.getDistanceKm() <= radiusKm)
                .sorted((a, b) -> Double.compare(
                        a.getDistanceKm(), b.getDistanceKm()))
                .collect(Collectors.toList());
    }

    // 2. Search salons by city
    public List<SalonLocationResponse> findSalonsByCity(String city) {
        return salonRepository.findAll().stream()
                .filter(salon -> Boolean.TRUE.equals(salon.getIsActive()))
                .filter(salon -> salon.getCity()
                        .equalsIgnoreCase(city.trim()))
                .map(salon -> buildLocationResponse(salon, 0.0))
                .collect(Collectors.toList());
    }

    // 3. Directions between two points
    public String getDirectionsUrl(Double fromLat, Double fromLng,
                                   Double toLat, Double toLng) {
        return "https://www.google.com/maps/dir/" +
                fromLat + "," + fromLng + "/" +
                toLat + "," + toLng;
    }

    // 3b. Directions to specific salon
    public String getDirectionsToSalon(Double fromLat, Double fromLng,
                                       Long salonId) {
        Salon salon = salonRepository.findById(salonId)
                .orElseThrow(() -> new RuntimeException("Salon not found"));
        return "https://www.google.com/maps/dir/" +
                fromLat + "," + fromLng + "/" +
                salon.getLatitude() + "," + salon.getLongitude();
    }

    // 4. Google Maps link for salon
    public String getSalonMapsUrl(Long salonId) {
        Salon salon = salonRepository.findById(salonId)
                .orElseThrow(() -> new RuntimeException("Salon not found"));

        if (salon.getGooglePlaceId() != null) {
            return "https://www.google.com/maps/place/?q=place_id:"
                    + salon.getGooglePlaceId();
        }
        return "https://www.google.com/maps?q=" +
                salon.getLatitude() + "," + salon.getLongitude();
    }

    // Helper: build response
    private SalonLocationResponse buildLocationResponse(
            Salon salon, double distance) {
        return new SalonLocationResponse(
                salon.getId(),
                salon.getName(),
                salon.getAddress(),
                salon.getCity(),
                salon.getLatitude(),
                salon.getLongitude(),
                Math.round(distance * 10.0) / 10.0,
                buildGoogleMapsUrl(salon.getLatitude(), salon.getLongitude()),
                salon.getRating() != null ?
                        salon.getRating().doubleValue() : 0.0,
                salon.getPhone()
        );
    }

    // Helper: build maps URL
    public String buildGoogleMapsUrl(Double lat, Double lng) {
        return "https://www.google.com/maps?q=" + lat + "," + lng;
    }

    // Helper: Haversine formula
    public double calculateDistance(Double lat1, Double lon1,
                                    Double lat2, Double lon2) {
        final int R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1))
                * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}