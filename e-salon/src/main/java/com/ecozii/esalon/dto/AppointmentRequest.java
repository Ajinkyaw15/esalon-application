package com.ecozii.esalon.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AppointmentRequest {
    private Long salonId;
    private Long serviceId;
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private String notes;

    //new field for home appointment
    private String appointmentType;
    private String customerAddress;
    private String customerCity;
    private String customerPostalCode;

}