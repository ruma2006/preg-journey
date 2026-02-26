package com.ammarakshitha.model;

import com.ammarakshitha.model.enums.ConsultationStatus;
import com.ammarakshitha.model.enums.ConsultationType;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Table(name = "consultations", indexes = {
    @Index(name = "idx_consultation_patient", columnList = "patient_id"),
    @Index(name = "idx_consultation_doctor", columnList = "doctor_id"),
    @Index(name = "idx_consultation_scheduled", columnList = "scheduled_at"),
    @Index(name = "idx_consultation_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Consultation extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private User doctor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ConsultationType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ConsultationStatus status = ConsultationStatus.SCHEDULED;

    @Column(name = "scheduled_at", nullable = false)
    private LocalDateTime scheduledAt;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    // Video call details
    @Column(name = "video_room_id")
    private String videoRoomId;

    @Column(name = "video_room_url")
    private String videoRoomUrl;

    // Consultation details
    @Column(name = "chief_complaint", columnDefinition = "TEXT")
    private String chiefComplaint;

    @Column(name = "history_of_present_illness", columnDefinition = "TEXT")
    private String historyOfPresentIllness;

    @Column(name = "examination_findings", columnDefinition = "TEXT")
    private String examinationFindings;

    @Column(name = "diagnosis", columnDefinition = "TEXT")
    private String diagnosis;

    @Column(name = "treatment_plan", columnDefinition = "TEXT")
    private String treatmentPlan;

    @Column(name = "prescriptions", columnDefinition = "TEXT")
    private String prescriptions;

    @Column(name = "advice", columnDefinition = "TEXT")
    private String advice;

    @Column(name = "referral_required")
    @Builder.Default
    private Boolean referralRequired = false;

    @Column(name = "referral_details", columnDefinition = "TEXT")
    private String referralDetails;

    @Column(name = "follow_up_required")
    @Builder.Default
    private Boolean followUpRequired = false;

    @Column(name = "follow_up_date")
    private LocalDateTime followUpDate;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    // Triggered by which health check (if any)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "triggered_by_health_check_id")
    private HealthCheck triggeredByHealthCheck;

    // Cancellation details
    @Column(name = "cancellation_reason")
    private String cancellationReason;

    @Column(name = "cancelled_by")
    private String cancelledBy;
}
