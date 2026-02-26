package com.ammarakshitha.dto;

import com.ammarakshitha.model.enums.FollowUpStatus;
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
public class FollowUpDTO {
    private Long id;
    private Long patientId;
    private String patientName;
    private String motherId;
    private String patientMobile;
    private RiskLevel patientRiskLevel;
    private Long assignedToId;
    private String assignedToName;
    private LocalDate scheduledDate;
    private FollowUpStatus status;
    private LocalDateTime callAttemptedAt;
    private LocalDateTime callCompletedAt;
    private Integer callDurationSeconds;
    private Integer attemptCount;
    private String patientCondition;
    private String symptomsReported;
    private Boolean medicationCompliance;
    private String concernsRaised;
    private String adviceGiven;
    private Boolean requiresDoctorConsultation;
    private Boolean requiresImmediateAttention;
    private String notes;
    private LocalDate nextFollowUpDate;
    private LocalDateTime createdAt;
}
