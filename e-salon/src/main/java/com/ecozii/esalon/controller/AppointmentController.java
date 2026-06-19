package com.ecozii.esalon.controller;

import com.ecozii.esalon.dto.AppointmentRequest;
import com.ecozii.esalon.dto.AppointmentResponse;
import com.ecozii.esalon.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    // Book appointment (requires JWT token)
    @PostMapping("/book")
    public ResponseEntity<AppointmentResponse> book(
            @RequestBody AppointmentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                appointmentService.bookAppointment(request, userDetails.getUsername()));
    }

    // Get my appointments (requires JWT token)
    @GetMapping("/my")
    public ResponseEntity<List<AppointmentResponse>> myAppointments(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                appointmentService.getUserAppointments(userDetails.getUsername()));
    }

    // Cancel appointment (requires JWT token)
    @PutMapping("/{id}/cancel")
    public ResponseEntity<AppointmentResponse> cancel(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                appointmentService.cancelAppointment(id, userDetails.getUsername()));
    }

    // Get available time slots (public)
    @GetMapping("/slots")
    public ResponseEntity<List<String>> availableSlots(
            @RequestParam Long salonId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(
                appointmentService.getAvailableSlots(salonId, date));
    }
}