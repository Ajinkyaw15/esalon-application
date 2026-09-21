package com.ecozii.esalon.service;

import org.springframework.stereotype.Service;

/**
 * Geographic helpers: coordinate validation and Haversine distance in kilometres.
 */
@Service
public class GeoDistanceService {

    private static final double EARTH_RADIUS_KM = 6371.0;
    private static final double MIN_RADIUS_KM = 0.5;
    private static final double MAX_RADIUS_KM = 100.0;

    public void validateCoordinates(Double latitude, Double longitude) {
        if (latitude == null || longitude == null
                || latitude.isNaN() || longitude.isNaN()
                || latitude.isInfinite() || longitude.isInfinite()) {
            throw new IllegalArgumentException("Latitude and longitude are required.");
        }
        if (latitude < -90 || latitude > 90) {
            throw new IllegalArgumentException("Latitude must be between -90 and 90.");
        }
        if (longitude < -180 || longitude > 180) {
            throw new IllegalArgumentException("Longitude must be between -180 and 180.");
        }
    }

    public double validateRadius(Double radiusKm) {
        if (radiusKm == null || radiusKm.isNaN() || radiusKm.isInfinite()) {
            throw new IllegalArgumentException("Search radius is required.");
        }
        if (radiusKm < MIN_RADIUS_KM || radiusKm > MAX_RADIUS_KM) {
            throw new IllegalArgumentException(
                    "Search radius must be between " + MIN_RADIUS_KM + " and " + MAX_RADIUS_KM + " km.");
        }
        return radiusKm;
    }

    public boolean hasValidCoordinates(Double latitude, Double longitude) {
        try {
            validateCoordinates(latitude, longitude);
            return true;
        } catch (IllegalArgumentException ex) {
            return false;
        }
    }

    /** Great-circle distance in kilometres using the Haversine formula. */
    public double distanceKm(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1))
                * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }

    public double roundOneDecimal(double km) {
        return Math.round(km * 10.0) / 10.0;
    }
}
