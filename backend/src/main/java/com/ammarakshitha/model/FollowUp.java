package com.ammarakshitha.model;

import com.ammarakshitha.model.enums.FollowUpStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Table(name = "follow_ups", indexes = {
    @Index(name = "idx_followup_patient", columnList = "patient_id"),
    @Index(name = "idx_followup_assigned", columnList = "assigned_to_id"),
    @Index(name = "idx_followup_date", columnList = "scheduled_date"),
    @Index(name = "idx_followup_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FollowUp extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_id", nullable = false)
    private User assignedTo;

    @Column(name = "scheduled_date", nullable = false)
    private LocalDate scheduledDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private FollowUpStatus status = FollowUpStatus.PENDING;

    @Column(name = "call_attempted_at")
    private LocalDateTime callAttemptedAt;

    @Column(name = "call_completed_at")
    private LocalDateTime callCompletedAt;

    @Column(name = "call_duration_seconds")
    private Integer callDurationSeconds;

    @Column(name = "attempt_count")
    @Builder.Default
    private Integer attemptCount = 0;

    // Call outcome
    @Column(name = "patient_condition", columnDefinition = "TEXT")
    private String patientCondition;

    @Column(name = "symptoms_reported", columnDefinition = "TEXT")
    private String symptomsReported;

    @Column(name = "medication_compliance")
    private Boolean medicationCompliance;

    @Column(name = "concerns_raised", columnDefinition = "TEXT")
    private String concernsRaised;

    @Column(name = "advice_given", columnDefinition = "TEXT")
    private String adviceGiven;

    @Column(name = "requires_doctor_consultation")
    @Builder.Default
    private Boolean requiresDoctorConsultation = false;

    @Column(name = "requires_immediate_attention")
    @Builder.Default
    private Boolean requiresImmediateAttention = false;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    // Photo documentation (uploaded by doctor/nurse after follow-up)
    @Column(name = "photo_url")
    private String photoUrl;

    // Next follow-up scheduling
    @Column(name = "next_follow_up_date")
    private LocalDate nextFollowUpDate;

    // Triggered by which health check or consultation
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "triggered_by_health_check_id")
    private HealthCheck triggeredByHealthCheck;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "triggered_by_consultation_id")
    private Consultation triggeredByConsultation;
}
