package com.ammarakshitha.dto;

import com.ammarakshitha.model.enums.ConsultationType;
import com.ammarakshitha.model.enums.TeleconsultationPlatform;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsultationRequest {

    private Long id; // For updates

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Doctor ID is required")
    private Long doctorId;

    @NotNull(message = "Consultation type is required")
    private ConsultationType type;

    @NotNull(message = "Scheduled time is required")
    private LocalDateTime scheduledAt;

    // Teleconsultation details
    private TeleconsultationPlatform teleconsultationPlatform;
    private String teleconsultationLink;

    private String chiefComplaint;
    private String historyOfPresentIllness;
    private String examinationFindings;
    private String diagnosis;
    private String treatmentPlan;
    private String prescriptions;
    private String advice;
    private Boolean referralRequired;
    private String referralDetails;
    private Boolean followUpRequired;
    private LocalDateTime followUpDate;
    private String notes;
}
