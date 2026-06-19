package com.ecozii.esalon.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AppointmentResponse {
    private Long id;
    private String salonName;
    private String serviceName;
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private Integer duration;
    private Double price;
    private String status;
    private String notes;

    //new fields for home appointment
    private String appointmentType;
    private String customerAddress;
    private String customerCity;
    private String customerPostalCode;


}