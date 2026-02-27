package com.ammarakshitha.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientRegistrationRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    @NotNull(message = "Age is required")
    @Min(value = 12, message = "Age must be at least 12")
    @Max(value = 60, message = "Age must not exceed 60")
    private Integer age;

    @Size(max = 100, message = "Husband name must not exceed 100 characters")
    private String husbandName;

    @NotBlank(message = "Residence is required")
    @Size(max = 500, message = "Residence must not exceed 500 characters")
    private String residence;

    @Size(max = 100)
    private String district;

    @Size(max = 100)
    private String mandal;

    @Size(max = 100)
    private String village;

    @Size(max = 10)
    private String pincode;

    @Pattern(regexp = "^$|^\\d{12}$", message = "Aadhaar number must be exactly 12 digits")
    private String aadhaarNumber;

    @NotBlank(message = "Mobile number is required")
    @Size(min = 10, max = 15, message = "Invalid mobile number")
    @Pattern(regexp = "^[0-9]{10,15}$", message = "Mobile number must contain only digits")
    private String mobileNumber;

    @Size(max = 15)
    private String alternateMobile;

    private LocalDate dateOfBirth;

    private LocalDate lmpDate;

    @Min(value = 0, message = "Gravida must be non-negative")
    private Integer gravida;

    @Min(value = 0, message = "Para must be non-negative")
    private Integer para;

    @Size(max = 5)
    private String bloodGroup;

    private Boolean hasPreviousComplications;

    private String previousComplicationsDetails;

    private String medicalHistory;

    private String allergies;
}
