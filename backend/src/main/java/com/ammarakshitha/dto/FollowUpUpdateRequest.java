package com.ammarakshitha.dto;

import com.ammarakshitha.model.enums.FollowUpStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FollowUpUpdateRequest {

    @NotNull(message = "Status is required")
    private FollowUpStatus status;

    private Integer callDurationSeconds;
    private String patientCondition;
    private String symptomsReported;
    private Boolean medicationCompliance;
    private String concernsRaised;
    private String adviceGiven;
    private Boolean requiresDoctorConsultation;
    private Boolean requiresImmediateAttention;
    private LocalDate nextFollowUpDate;
    private String notes;
}
