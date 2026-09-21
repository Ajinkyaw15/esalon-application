package com.ecozii.esalon.service;

import com.ecozii.esalon.dto.SalonLocationResponse;
import com.ecozii.esalon.model.Salon;
import com.ecozii.esalon.repository.SalonRepository;
import com.ecozii.esalon.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MapsService {

    private static final ZoneId BUSINESS_ZONE = ZoneId.of("Asia/Kolkata");

    private final SalonRepository salonRepository;
    private final ServiceRepository serviceRepository;
    private final AppointmentService appointmentService;
    private final GeoDistanceService geoDistanceService;

    public List<SalonLocationResponse> findNearbySalons(
            Double latitude, Double longitude, Double radiusKm) {
        return findNearbySalons(latitude, longitude, radiusKm, null, null, "nearest");
    }

    public List<SalonLocationResponse> findNearbySalons(
            Double latitude,
            Double longitude,
            Double radiusKm,
            Long serviceId,
            String serviceName,
            String sort) {

        geoDistanceService.validateCoordinates(latitude, longitude);
        double radius = geoDistanceService.validateRadius(radiusKm);
        String requestedService = resolveRequestedServiceName(serviceId, serviceName);
        String sortKey = normalizeSort(sort);

        List<Salon> active = salonRepository.findByIsActiveTrueOrderByRatingDesc();

        Map<Long, List<String>> servicesBySalon = loadServiceNames(
                active.stream().map(Salon::getId).toList());

        Set<Long> matchingSalonIds = null;
        if (requestedService != null) {
            matchingSalonIds = servicesBySalon.entrySet().stream()
                    .filter(e -> e.getValue().stream()
                            .anyMatch(n -> n.equalsIgnoreCase(requestedService)))
                    .map(Map.Entry::getKey)
                    .collect(Collectors.toSet());
        }

        List<SalonLocationResponse> results = new ArrayList<>();
        for (Salon salon : active) {
            if (!geoDistanceService.hasValidCoordinates(salon.getLatitude(), salon.getLongitude())) {
                continue;
            }
            if (matchingSalonIds != null && !matchingSalonIds.contains(salon.getId())) {
                continue;
            }
            double distance = geoDistanceService.distanceKm(
                    latitude, longitude, salon.getLatitude(), salon.getLongitude());
            if (distance > radius) {
                continue;
            }
            results.add(buildLocationResponse(
                    salon,
                    distance,
                    servicesBySalon.getOrDefault(salon.getId(), List.of()),
                    requestedService));
        }

        boolean requireAvailability = "available_soon".equals(sortKey);
        if (requireAvailability) {
            results.removeIf(s -> s.getNextAvailableSlot() == null);
        }

        results.sort(comparatorFor(sortKey));
        return results;
    }

    public List<SalonLocationResponse> findSalonsByCity(String city) {
        if (city == null || city.isBlank()) {
            throw new IllegalArgumentException("City is required.");
        }
        String needle = city.trim();
        return salonRepository.findByIsActiveTrueOrderByRatingDesc().stream()
                .filter(salon -> salon.getCity() != null && salon.getCity().equalsIgnoreCase(needle))
                .map(salon -> buildLocationResponse(salon, 0.0, List.of(), null))
                .collect(Collectors.toList());
    }

    public String getDirectionsUrl(Double fromLat, Double fromLng,
                                   Double toLat, Double toLng) {
        geoDistanceService.validateCoordinates(fromLat, fromLng);
        geoDistanceService.validateCoordinates(toLat, toLng);
        return "https://www.google.com/maps/dir/?api=1"
                + "&origin=" + fromLat + "," + fromLng
                + "&destination=" + toLat + "," + toLng;
    }

    public String getDirectionsToSalon(Double fromLat, Double fromLng, Long salonId) {
        geoDistanceService.validateCoordinates(fromLat, fromLng);
        Salon salon = salonRepository.findById(salonId)
                .orElseThrow(() -> new RuntimeException("Salon not found"));
        if (!geoDistanceService.hasValidCoordinates(salon.getLatitude(), salon.getLongitude())) {
            throw new IllegalArgumentException("This salon does not have map coordinates yet.");
        }
        return getDirectionsUrl(fromLat, fromLng, salon.getLatitude(), salon.getLongitude());
    }

    public String getSalonMapsUrl(Long salonId) {
        Salon salon = salonRepository.findById(salonId)
                .orElseThrow(() -> new RuntimeException("Salon not found"));

        if (salon.getGooglePlaceId() != null && !salon.getGooglePlaceId().isBlank()) {
            return "https://www.google.com/maps/place/?q=place_id:"
                    + salon.getGooglePlaceId();
        }
        if (!geoDistanceService.hasValidCoordinates(salon.getLatitude(), salon.getLongitude())) {
            throw new IllegalArgumentException("This salon does not have map coordinates yet.");
        }
        return buildGoogleMapsUrl(salon.getLatitude(), salon.getLongitude());
    }

    public String buildGoogleMapsUrl(Double lat, Double lng) {
        return "https://www.google.com/maps?q=" + lat + "," + lng;
    }

    public double calculateDistance(Double lat1, Double lon1, Double lat2, Double lon2) {
        geoDistanceService.validateCoordinates(lat1, lon1);
        geoDistanceService.validateCoordinates(lat2, lon2);
        return geoDistanceService.distanceKm(lat1, lon1, lat2, lon2);
    }

    private SalonLocationResponse buildLocationResponse(
            Salon salon,
            double distance,
            List<String> services,
            String requestedService) {
        LocalDate today = LocalDate.now(BUSINESS_ZONE);
        String nextSlot = appointmentService.getNextAvailableSlot(salon.getId(), today);
        boolean offers = requestedService != null && services.stream()
                .anyMatch(n -> n.equalsIgnoreCase(requestedService));
        return SalonLocationResponse.builder()
                .id(salon.getId())
                .name(salon.getName())
                .address(salon.getAddress())
                .city(salon.getCity())
                .latitude(salon.getLatitude())
                .longitude(salon.getLongitude())
                .distanceKm(geoDistanceService.roundOneDecimal(distance))
                .googleMapsUrl(buildGoogleMapsUrl(salon.getLatitude(), salon.getLongitude()))
                .rating(salon.getRating() != null ? salon.getRating().doubleValue() : 0.0)
                .phone(salon.getPhone())
                .imageUrl(salon.getImageUrl())
                .openingTime(salon.getOpeningTime())
                .closingTime(salon.getClosingTime())
                .services(services)
                .nextAvailableSlot(nextSlot)
                .offersRequestedService(offers)
                .build();
    }

    private Map<Long, List<String>> loadServiceNames(List<Long> salonIds) {
        if (salonIds.isEmpty()) {
            return Map.of();
        }
        Map<Long, List<String>> map = new LinkedHashMap<>();
        for (com.ecozii.esalon.model.Service svc : serviceRepository.findBySalonIdInAndIsActiveTrue(salonIds)) {
            map.computeIfAbsent(svc.getSalonId(), id -> new ArrayList<>()).add(svc.getName());
        }
        return map;
    }

    private String resolveRequestedServiceName(Long serviceId, String serviceName) {
        if (serviceId != null) {
            return serviceRepository.findById(serviceId)
                    .filter(s -> Boolean.TRUE.equals(s.getIsActive()))
                    .map(com.ecozii.esalon.model.Service::getName)
                    .orElseThrow(() -> new IllegalArgumentException("Service not found."));
        }
        if (serviceName != null && !serviceName.isBlank()) {
            return serviceName.trim();
        }
        return null;
    }

    private String normalizeSort(String sort) {
        if (sort == null || sort.isBlank()) {
            return "nearest";
        }
        return switch (sort.trim().toLowerCase(Locale.ROOT).replace('-', '_').replace(' ', '_')) {
            case "farthest", "farthest_first" -> "farthest";
            case "recommended", "rating" -> "recommended";
            case "available_soon", "available", "soon" -> "available_soon";
            default -> "nearest";
        };
    }

    private Comparator<SalonLocationResponse> comparatorFor(String sortKey) {
        Comparator<SalonLocationResponse> byDistance = Comparator.comparing(
                s -> s.getDistanceKm() != null ? s.getDistanceKm() : Double.MAX_VALUE);
        Comparator<SalonLocationResponse> byRating = Comparator.comparing(
                (SalonLocationResponse s) -> s.getRating() != null ? s.getRating() : 0.0).reversed();
        Comparator<SalonLocationResponse> bySlot = Comparator.comparing(
                (SalonLocationResponse s) -> s.getNextAvailableSlot() == null ? "99:99" : s.getNextAvailableSlot());
        return switch (sortKey) {
            case "farthest" -> byDistance.reversed().thenComparing(byRating);
            case "recommended" -> byRating.thenComparing(byDistance);
            case "available_soon" -> bySlot.thenComparing(byDistance);
            default -> byDistance.thenComparing(byRating);
        };
    }
}
