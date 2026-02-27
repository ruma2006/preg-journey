package com.ammarakshitha.dto;

import com.ammarakshitha.model.enums.PatientStatus;
import com.ammarakshitha.model.enums.RiskLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientDTO {
    private Long id;
    private String name;
    private Integer age;
    private String husbandName;
    private String residence;
    private String district;
    private String mandal;
    private String village;
    private String pincode;
    private String motherId;
    private String aadhaarNumber;
    private String mobileNumber;
    private String alternateMobile;
    private String email;
    private LocalDate dateOfBirth;
    private LocalDate lmpDate;
    private LocalDate eddDate;
    private Integer gravida;
    private Integer para;
    private String bloodGroup;
    private RiskLevel currentRiskLevel;
    private Integer currentRiskScore;
    private PatientStatus status;
    private Boolean hasPreviousComplications;
    private String previousComplicationsDetails;
    private String medicalHistory;
    private String allergies;
    private Boolean hadCSectionDelivery;
    private Boolean hadNormalDelivery;
    private Boolean hadAbortion;
    private Boolean hadOtherPregnancy;
    private String otherPregnancyDetails;
    private Integer totalKidsBorn;
    private LocalDate registrationDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Summary fields for list views
    private Long totalHealthChecks;
    private LocalDate lastHealthCheckDate;
    private Long pendingFollowUps;
}
