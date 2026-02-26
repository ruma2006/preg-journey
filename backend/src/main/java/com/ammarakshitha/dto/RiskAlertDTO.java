package com.ammarakshitha.dto;

import com.ammarakshitha.model.enums.AlertType;
import com.ammarakshitha.model.enums.RiskLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RiskAlertDTO {
    private Long id;
    private Long patientId;
    private String patientName;
    private String motherId;
    private String patientMobile;
    private Long healthCheckId;
    private AlertType alertType;
    private RiskLevel severity;
    private String title;
    private String description;
    private String riskFactors;
    private String recommendedAction;
    private Boolean isAcknowledged;
    private String acknowledgedByName;
    private LocalDateTime acknowledgedAt;
    private String acknowledgmentNotes;
    private String actionTaken;
    private Boolean isResolved;
    private LocalDateTime resolvedAt;
    private String resolutionNotes;
    private Boolean smsSent;
    private LocalDateTime smsSentAt;
    private LocalDateTime createdAt;
}
