package com.ammarakshitha.dto;

import com.ammarakshitha.model.enums.RiskLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthCheckDTO {
    private Long id;
    private Long patientId;
    private String patientName;
    private String motherId;
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

    // Risk Assessment
    private RiskLevel riskLevel;
    private Integer riskScore;
    private String riskFactors;

    // Notes
    private String notes;
    private String recommendations;
    private LocalDate nextCheckDate;

    // Audit
    private String performedByName;
    private LocalDateTime createdAt;
}
