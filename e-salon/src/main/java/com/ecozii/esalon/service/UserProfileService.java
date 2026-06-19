package com.ecozii.esalon.service;

import com.ecozii.esalon.dto.*;
import com.ecozii.esalon.model.Appointment;
import com.ecozii.esalon.model.Salon;
import com.ecozii.esalon.model.User;
import com.ecozii.esalon.repository.AppointmentRepository;
import com.ecozii.esalon.repository.SalonRepository;
import com.ecozii.esalon.repository.ServiceRepository;
import com.ecozii.esalon.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final SalonRepository salonRepository;
    private final ServiceRepository serviceRepository;
    private final PasswordEncoder passwordEncoder;
    private final S3Service s3Service;

    // Get full profile with recent appointments
    public UserProfileResponse getProfile(String email) {
        User user = getUser(email);

        UserProfileResponse response = new UserProfileResponse();
        response.setId(user.getId());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setProfileImageUrl(user.getProfileImageUrl());
        response.setRole(user.getRole().name());
        response.setCreatedAt(user.getCreatedAt());

        // Get last 5 appointments
        List<Appointment> appointments = appointmentRepository
                .findByCustomerIdOrderByAppointmentDateDesc(user.getId());

        List<AppointmentResponse> appointmentResponses = new ArrayList<>();
        int limit = Math.min(appointments.size(), 5);

        for (int i = 0; i < limit; i++) {
            Appointment a = appointments.get(i);

            String salonName = salonRepository.findById(a.getSalonId())
                    .map(Salon::getName).orElse("Unknown Salon");

            com.ecozii.esalon.model.Service svc =
                    serviceRepository.findById(a.getServiceId()).orElse(null);

            String serviceName = svc != null ? svc.getName()     : "Unknown";
            Integer duration   = svc != null ? svc.getDuration() : 0;
            BigDecimal price   = svc != null ? svc.getPrice()    : BigDecimal.ZERO;

            AppointmentResponse ar = new AppointmentResponse();
            ar.setId(a.getId());
            ar.setSalonName(salonName);
            ar.setServiceName(serviceName);
            ar.setAppointmentDate(a.getAppointmentDate());
            ar.setAppointmentTime(a.getAppointmentTime());
            ar.setDuration(duration);
            ar.setPrice(price != null ? price.doubleValue() : 0.0);
            ar.setStatus(a.getStatus().name());
            ar.setNotes(a.getNotes());

            appointmentResponses.add(ar);
        }

        response.setRecentAppointments(appointmentResponses);
        return response;
    }

    // Update name and phone
    public UserProfileResponse updateProfile(String email,
                                             UpdateProfileRequest request) {
        User user = getUser(email);

        if (request.getFirstName() != null)
            user.setFirstName(request.getFirstName());
        if (request.getLastName() != null)
            user.setLastName(request.getLastName());
        if (request.getPhone() != null)
            user.setPhone(request.getPhone());

        userRepository.save(user);
        return getProfile(email);
    }

    // Upload profile image to S3
    public UserProfileResponse uploadProfileImage(String email,
                                                  MultipartFile file) {
        User user = getUser(email);

        // Delete old image from S3 if exists
        if (user.getProfileImageUrl() != null &&
                user.getProfileImageUrl().contains("amazonaws.com")) {
            s3Service.deleteFile(user.getProfileImageUrl());
        }

        // Upload new image
        String imageUrl = s3Service.uploadFile(file, "profile-images");
        user.setProfileImageUrl(imageUrl);
        userRepository.save(user);

        return getProfile(email);
    }

    // Change password
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = getUser(email);

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(),
                user.getPassword())) {
            throw new RuntimeException("Current password is incorrect!");
        }

        // Check new passwords match
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("New passwords do not match!");
        }

        // Validate length
        if (request.getNewPassword().length() < 6) {
            throw new RuntimeException("Password must be at least 6 characters!");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    // Deactivate account
    public void deactivateAccount(String email) {
        User user = getUser(email);
        user.setIsActive(false);
        userRepository.save(user);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "User not found: " + email));
    }
}