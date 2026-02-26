package com.ammarakshitha.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthCheckRequest {
	
	private Long id; // Required for updates, ignored for creates

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    private LocalDate checkDate;

    // Vital Signs
    private Integer bpSystolic;
    private Integer bpDiastolic;
    private Integer pulseRate;
    private BigDecimal temperature;
    private Integer respiratoryRate;
    private Integer spo2;

    // Blood Tests
    private BigDecimal hemoglobin;
    private BigDecimal bloodSugarFasting;
    private BigDecimal bloodSugarPP;
    private BigDecimal bloodSugarRandom;

    // Physical Measurements
    private BigDecimal weight;
    private BigDecimal height;
    private BigDecimal fundalHeight;

    // Pregnancy Specific
    private Integer fetalHeartRate;
    private Boolean fetalMovement;
    private String urineAlbumin;
    private String urineSugar;

    // Symptoms
    private String symptoms;
    private Boolean swellingObserved;
    private Boolean bleedingReported;
    private Boolean headacheReported;
    private Boolean blurredVisionReported;
    private Boolean abdominalPainReported;

    // Notes
    private String notes;
    private String recommendations;
    private LocalDate nextCheckDate;

    // Follow-up scheduling
    private Boolean scheduleFollowUp;
    private LocalDate followUpDate;
    private Long followUpAssigneeId;
    private String followUpNotes;

    // Auto follow-up control (if false, no auto follow-up even for high risk)
    private Boolean autoFollowUpEnabled = true;
}
