package com.ecozii.esalon.service;

import com.ecozii.esalon.dto.AppointmentRequest;
import com.ecozii.esalon.dto.AppointmentResponse;
import com.ecozii.esalon.model.Appointment;
import com.ecozii.esalon.model.Salon;
import com.ecozii.esalon.repository.AppointmentRepository;
import com.ecozii.esalon.repository.SalonRepository;
import com.ecozii.esalon.repository.ServiceRepository;
import com.ecozii.esalon.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final SalonRepository salonRepository;
    private final ServiceRepository serviceRepository;

    // ── Book Appointment ────────────────────────────────────────────
    public AppointmentResponse bookAppointment(AppointmentRequest request, String userEmail) {

        Long userId = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"))
                .getId();

        Salon salon = salonRepository.findById(request.getSalonId())
                .orElseThrow(() -> new RuntimeException("Salon not found"));

        com.ecozii.esalon.model.Service service = serviceRepository
                .findById(request.getServiceId())
                .orElseThrow(() -> new RuntimeException("Service not found"));

        boolean conflict = appointmentRepository
                .existsBySalonIdAndAppointmentDateAndAppointmentTime(
                        request.getSalonId(),
                        request.getAppointmentDate(),
                        request.getAppointmentTime());
        if (conflict) {
            throw new RuntimeException("This time slot is already booked!");
        }

        Appointment appointment = Appointment.builder()
                .customerId(userId)
                .salonId(request.getSalonId())
                .serviceId(request.getServiceId())
                .appointmentDate(request.getAppointmentDate())
                .appointmentTime(request.getAppointmentTime())
                .notes(request.getNotes())
                .status(Appointment.AppointmentStatus.PENDING)
                .totalAmount(service.getPrice())
                .build();

        Appointment saved = appointmentRepository.save(appointment);

        return mapToResponse(saved,
                salon.getName(),
                service.getName(),
                service.getDuration(),
                service.getPrice());
    }

    // ── Get User Appointments ───────────────────────────────────────
    public List<AppointmentResponse> getUserAppointments(String userEmail) {

        Long userId = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"))
                .getId();

        List<Appointment> appointments =
                appointmentRepository.findByCustomerIdOrderByAppointmentDateDesc(userId);

        List<AppointmentResponse> responses = new ArrayList<>();

        for (Appointment a : appointments) {
            String salonName = salonRepository.findById(a.getSalonId())
                    .map(Salon::getName)
                    .orElse("Unknown Salon");

            com.ecozii.esalon.model.Service svc =
                    serviceRepository.findById(a.getServiceId()).orElse(null);

            String serviceName = svc != null ? svc.getName()     : "Unknown";
            Integer duration   = svc != null ? svc.getDuration() : 0;
            BigDecimal price   = svc != null ? svc.getPrice()    : BigDecimal.ZERO;

            responses.add(mapToResponse(a, salonName, serviceName, duration, price));
        }

        return responses;
    }

    // ── Cancel Appointment ──────────────────────────────────────────
    public AppointmentResponse cancelAppointment(Long appointmentId, String userEmail) {

        Long userId = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"))
                .getId();

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (!appointment.getCustomerId().equals(userId)) {
            throw new RuntimeException("Unauthorized to cancel this appointment");
        }
        if (appointment.getStatus() == Appointment.AppointmentStatus.CANCELLED) {
            throw new RuntimeException("Appointment is already cancelled");
        }

        appointment.setStatus(Appointment.AppointmentStatus.CANCELLED);
        Appointment saved = appointmentRepository.save(appointment);

        String salonName = salonRepository.findById(saved.getSalonId())
                .map(Salon::getName)
                .orElse("Unknown Salon");

        com.ecozii.esalon.model.Service svc =
                serviceRepository.findById(saved.getServiceId()).orElse(null);

        String serviceName = svc != null ? svc.getName()     : "Unknown";
        Integer duration   = svc != null ? svc.getDuration() : 0;
        BigDecimal price   = svc != null ? svc.getPrice()    : BigDecimal.ZERO;

        return mapToResponse(saved, salonName, serviceName, duration, price);
    }

    // ── Get Available Slots ─────────────────────────────────────────
    public List<String> getAvailableSlots(Long salonId, LocalDate date) {

        salonRepository.findById(salonId)
                .orElseThrow(() -> new RuntimeException("Salon not found"));

        List<LocalTime> bookedTimes =
                appointmentRepository.findBookedTimesBySalonIdAndDate(salonId, date);

        List<String> slots = new ArrayList<>();
        LocalTime start = LocalTime.of(9, 0);
        LocalTime end   = LocalTime.of(19, 0);

        while (start.isBefore(end)) {
            if (!bookedTimes.contains(start)) {
                slots.add(start.toString());
            }
            start = start.plusMinutes(30);
        }
        return slots;
    }

    // ── Helper ──────────────────────────────────────────────────────
    private AppointmentResponse mapToResponse(Appointment a,
                                              String salonName, String serviceName,
                                              Integer duration, BigDecimal price) {

        AppointmentResponse res = new AppointmentResponse();
        res.setId(a.getId());
        res.setSalonName(salonName);
        res.setServiceName(serviceName);
        res.setAppointmentDate(a.getAppointmentDate());
        res.setAppointmentTime(a.getAppointmentTime());
        res.setDuration(duration);
        res.setPrice(price != null ? price.doubleValue() : 0.0);
        res.setStatus(a.getStatus().name());
        res.setNotes(a.getNotes());
        return res;
    }
}