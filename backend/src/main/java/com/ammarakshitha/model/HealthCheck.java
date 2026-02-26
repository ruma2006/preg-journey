package com.ammarakshitha.model;

import com.ammarakshitha.model.enums.RiskLevel;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Table(name = "health_checks", indexes = {
    @Index(name = "idx_health_check_patient", columnList = "patient_id"),
    @Index(name = "idx_health_check_date", columnList = "check_date"),
    @Index(name = "idx_health_check_risk", columnList = "risk_level")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthCheck extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @NotNull
    @Column(name = "check_date", nullable = false)
    private LocalDate checkDate;

    // Vital Signs
    @Column(name = "bp_systolic")
    private Integer bpSystolic;

    @Column(name = "bp_diastolic")
    private Integer bpDiastolic;

    @Column(name = "pulse_rate")
    private Integer pulseRate;

    @Column(name = "temperature", precision = 4, scale = 1)
    private BigDecimal temperature;

    @Column(name = "respiratory_rate")
    private Integer respiratoryRate;

    @Column(name = "spo2")
    private Integer spo2;  // Oxygen saturation

    // Blood Tests
    @Column(name = "hemoglobin", precision = 4, scale = 1)
    private BigDecimal hemoglobin;

    @Column(name = "blood_sugar_fasting", precision = 5, scale = 1)
    private BigDecimal bloodSugarFasting;

    @Column(name = "blood_sugar_pp", precision = 5, scale = 1)
    private BigDecimal bloodSugarPP;  // Post Prandial

    @Column(name = "blood_sugar_random", precision = 5, scale = 1)
    private BigDecimal bloodSugarRandom;

    // Physical Measurements
    @Column(name = "weight", precision = 5, scale = 2)
    private BigDecimal weight;

    @Column(name = "height", precision = 5, scale = 2)
    private BigDecimal height;

    @Column(name = "fundal_height", precision = 4, scale = 1)
    private BigDecimal fundalHeight;

    // Pregnancy Specific
    @Column(name = "fetal_heart_rate")
    private Integer fetalHeartRate;

    @Column(name = "fetal_movement")
    private Boolean fetalMovement;

    @Column(name = "urine_albumin")
    private String urineAlbumin;

    @Column(name = "urine_sugar")
    private String urineSugar;

    // Symptoms & Observations
    @Column(name = "symptoms", columnDefinition = "TEXT")
    private String symptoms;

    @Column(name = "swelling_observed")
    private Boolean swellingObserved;

    @Column(name = "bleeding_reported")
    private Boolean bleedingReported;

    @Column(name = "headache_reported")
    private Boolean headacheReported;

    @Column(name = "blurred_vision_reported")
    private Boolean blurredVisionReported;

    @Column(name = "abdominal_pain_reported")
    private Boolean abdominalPainReported;

    // Risk Assessment
    @Enumerated(EnumType.STRING)
    @Column(name = "risk_level", nullable = false)
    @Builder.Default
    private RiskLevel riskLevel = RiskLevel.GREEN;

    @Column(name = "risk_score")
    @Builder.Default
    private Integer riskScore = 0;

    @Column(name = "risk_factors", columnDefinition = "TEXT")
    private String riskFactors;

    // Notes
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "recommendations", columnDefinition = "TEXT")
    private String recommendations;

    // Performed by
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "performed_by")
    private User performedBy;

    // Next check date
    @Column(name = "next_check_date")
    private LocalDate nextCheckDate;
}
