package com.ecozii.esalon.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String firstName;   // changed from name
    private String lastName;    // added
    private String email;
    private String password;
    private String phone;
}