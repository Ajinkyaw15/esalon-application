package com.ecozii.esalon.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class UserProfileResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String profileImageUrl;
    private String role;
    private LocalDateTime createdAt;
    private List<AppointmentResponse> recentAppointments;
}