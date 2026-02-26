package com.ammarakshitha.dto;

import com.ammarakshitha.model.enums.PatientStatus;
import com.ammarakshitha.model.enums.RiskLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientSearchRequest {
    private String searchTerm;
    private String district;
    private String mandal;
    private RiskLevel riskLevel;
    private PatientStatus status;
    private LocalDate registrationDateFrom;
    private LocalDate registrationDateTo;
    private LocalDate eddDateFrom;
    private LocalDate eddDateTo;
}
