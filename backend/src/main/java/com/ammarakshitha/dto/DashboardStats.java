package com.ammarakshitha.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStats {
    // Patient statistics
    private long totalPatients;
    private long activePatients;
    private long highRiskPatients;
    private long moderateRiskPatients;
    private long stablePatients;
    private long newRegistrationsToday;

    // Health check statistics
    private long healthChecksToday;
    private long healthChecksThisMonth;

    // Consultation statistics
    private long consultationsToday;
    private long upcomingConsultations;

    // Follow-up statistics
    private long followUpsToday;
    private long followUpsCompleted;
    private long overdueFollowUps;

    // Alert statistics
    private long unacknowledgedAlerts;
    private long criticalAlerts;
    private long todaysAlerts;

    // Delivery statistics
    private long successfulDeliveries;
    private long motherMortality;
    private long babyMortality;

    // Staff statistics
    private long activeDoctors;
    private long activeHelpDeskStaff;
}
