package com.ecozii.esalon.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
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
    private String imageUrl;
    private String openingTime;
    private String closingTime;
    private List<String> services;
    private String nextAvailableSlot;
    private Boolean offersRequestedService;
}
