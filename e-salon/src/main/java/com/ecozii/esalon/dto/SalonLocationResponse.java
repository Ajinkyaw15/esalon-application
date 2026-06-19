package com.ecozii.esalon.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SalonLocationResponse {
    private Long id;
    private String name;
    private String address;
    private String city;
    private Double latitude;
    private Double longitude;
    private Double distanceKm;
    private String googleMapsUrl;
    private Double rating;
    private String phone;
}