package com.ecozii.esalon.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class GeoDistanceServiceTest {

    private final GeoDistanceService geo = new GeoDistanceService();

    @Test
    void haversineMatchesNagpurExample() {
        double km = geo.distanceKm(21.1458, 79.0882, 21.1350, 79.0760);
        assertEquals(1.7, geo.roundOneDecimal(km), 0.05);
    }

    @Test
    void rejectsInvalidLatitude() {
        assertThrows(IllegalArgumentException.class, () -> geo.validateCoordinates(91.0, 79.0));
    }

    @Test
    void rejectsInvalidLongitude() {
        assertThrows(IllegalArgumentException.class, () -> geo.validateCoordinates(21.0, 181.0));
    }

    @Test
    void rejectsOutOfRangeRadius() {
        assertThrows(IllegalArgumentException.class, () -> geo.validateRadius(0.1));
        assertEquals(5.0, geo.validateRadius(5.0));
    }
}
