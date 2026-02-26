package com.ammarakshitha.dto;

import com.ammarakshitha.model.enums.ConsultationStatus;
import com.ammarakshitha.model.enums.ConsultationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsultationDTO {
    private Long id;
    private Long patientId;
    private String patientName;
    private String motherId;
    private Long doctorId;
    private String doctorName;
    private ConsultationType type;
    private ConsultationStatus status;
    private LocalDateTime scheduledAt;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private String videoRoomId;
    private String videoRoomUrl;
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
    private String cancellationReason;
    private LocalDateTime createdAt;
}
