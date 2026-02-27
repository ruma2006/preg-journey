package com.ammarakshitha.model;

import com.ammarakshitha.model.enums.DeliveryOutcome;
import com.ammarakshitha.model.enums.DeliveryType;
import com.ammarakshitha.model.enums.PatientStatus;
import com.ammarakshitha.model.enums.RiskLevel;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "healthChecks", "consultations", "followUps", "riskAlerts"})
@Table(name = "patients", indexes = {
    @Index(name = "idx_patient_mother_id", columnList = "mother_id"),
    @Index(name = "idx_patient_aadhaar", columnList = "aadhaar_number"),
    @Index(name = "idx_patient_mobile", columnList = "mobile_number"),
    @Index(name = "idx_patient_risk_level", columnList = "current_risk_level"),
    @Index(name = "idx_patient_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patient extends BaseEntity {

    @NotBlank
    @Size(max = 100)
    @Column(nullable = false)
    private String name;

    @NotNull
    @Min(12)
    @Max(60)
    @Column(nullable = false)
    private Integer age;

    @Size(max = 100)
    @Column(name = "husband_name")
    private String husbandName;

    @NotBlank
    @Size(max = 500)
    @Column(nullable = false)
    private String residence;

    @Size(max = 100)
    private String district;

    @Size(max = 100)
    private String mandal;

    @Size(max = 100)
    private String village;

    @Size(max = 10)
    private String pincode;

    @NotBlank
    @Size(max = 20)
    @Column(name = "mother_id", nullable = false, unique = true)
    private String motherId;

    @Size(max = 12)
    @Pattern(regexp = "^\\d{12}$")
    @Column(name = "aadhaar_number", unique = true)
    private String aadhaarNumber;

    @NotBlank
    @Size(min = 10, max = 15)
    @Column(name = "mobile_number", nullable = false)
    private String mobileNumber;

    @Size(max = 15)
    @Column(name = "alternate_mobile")
    private String alternateMobile;

    @jakarta.validation.constraints.Email
    @Size(max = 100)
    @Column(name = "email")
    private String email;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "lmp_date")
    private LocalDate lmpDate;  // Last Menstrual Period

    @Column(name = "edd_date")
    private LocalDate eddDate;  // Expected Delivery Date

    @Column(name = "gravida")
    private Integer gravida;    // Number of pregnancies

    @Column(name = "para")
    private Integer para;       // Number of deliveries

    @Column(name = "blood_group")
    @Size(max = 5)
    private String bloodGroup;

    @Enumerated(EnumType.STRING)
    @Column(name = "current_risk_level")
    @Builder.Default
    private RiskLevel currentRiskLevel = RiskLevel.GREEN;

    @Column(name = "current_risk_score")
    @Builder.Default
    private Integer currentRiskScore = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PatientStatus status = PatientStatus.ACTIVE;

    @Column(name = "has_previous_complications")
    @Builder.Default
    private Boolean hasPreviousComplications = false;

    @Column(name = "previous_complications_details", columnDefinition = "TEXT")
    private String previousComplicationsDetails;

    @Column(name = "medical_history", columnDefinition = "TEXT")
    private String medicalHistory;

    @Column(name = "allergies", columnDefinition = "TEXT")
    private String allergies;

    @Column(name = "registration_date", nullable = false)
    @Builder.Default
    private LocalDate registrationDate = LocalDate.now();

    // Delivery Information
    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_outcome")
    @Builder.Default
    private DeliveryOutcome deliveryOutcome = DeliveryOutcome.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_type")
    private DeliveryType deliveryType;

    @Column(name = "delivery_date")
    private LocalDate deliveryDate;

    @Column(name = "delivery_completed_at")
    private LocalDateTime deliveryCompletedAt;

    @Column(name = "delivery_notes", columnDefinition = "TEXT")
    private String deliveryNotes;

    @Column(name = "baby_weight")
    private Double babyWeight;  // in kg

    @Column(name = "baby_gender")
    @Size(max = 10)
    private String babyGender;

    @Column(name = "delivery_hospital")
    @Size(max = 200)
    private String deliveryHospital;

    // Mortality Information
    @Column(name = "mortality_date")
    private LocalDate mortalityDate;

    @Column(name = "mortality_cause", columnDefinition = "TEXT")
    private String mortalityCause;

    @Column(name = "mortality_notes", columnDefinition = "TEXT")
    private String mortalityNotes;

    // Registered by which user
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registered_by")
    private User registeredBy;

    // Delivery completed by which doctor
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delivery_completed_by")
    private User deliveryCompletedBy;

    // Health checks for this patient
    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @OrderBy("checkDate DESC")
    @Builder.Default
    private List<HealthCheck> healthChecks = new ArrayList<>();

    // Consultations for this patient
    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @OrderBy("scheduledAt DESC")
    @Builder.Default
    private Set<Consultation> consultations = new HashSet<>();

    // Follow-ups for this patient
    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @OrderBy("scheduledDate DESC")
    @Builder.Default
    private List<FollowUp> followUps = new ArrayList<>();

    // Risk alerts for this patient
    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @OrderBy("createdAt DESC")
    @Builder.Default
    private List<RiskAlert> riskAlerts = new ArrayList<>();
}
