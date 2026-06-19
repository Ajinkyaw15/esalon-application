package com.ecozii.esalon.controller;

import com.ecozii.esalon.dto.ChangePasswordRequest;
import com.ecozii.esalon.dto.UpdateProfileRequest;
import com.ecozii.esalon.dto.UserProfileResponse;
import com.ecozii.esalon.service.UserProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserProfileController {

    private final UserProfileService userProfileService;

    // GET my profile
    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                userProfileService.getProfile(userDetails.getUsername()));
    }

    // PUT update profile
    @PutMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(
                userProfileService.updateProfile(
                        userDetails.getUsername(), request));
    }

    // POST upload profile image
    @PostMapping("/profile/image")
    public ResponseEntity<UserProfileResponse> uploadImage(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(
                userProfileService.uploadProfileImage(
                        userDetails.getUsername(), file));
    }

    // PUT change password
    @PutMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ChangePasswordRequest request) {
        userProfileService.changePassword(userDetails.getUsername(), request);
        return ResponseEntity.ok(
                Map.of("message", "Password changed successfully!"));
    }

    // DELETE deactivate account
    @DeleteMapping("/account")
    public ResponseEntity<Map<String, String>> deactivateAccount(
            @AuthenticationPrincipal UserDetails userDetails) {
        userProfileService.deactivateAccount(userDetails.getUsername());
        return ResponseEntity.ok(
                Map.of("message", "Account deactivated successfully!"));
    }
}
