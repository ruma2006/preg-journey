package com.ammarakshitha.model.enums;

public enum AlertType {
    HIGH_RISK_DETECTED,      // System detected high risk during assessment
    CRITICAL_VITALS,         // Critical vital signs recorded
    MISSED_APPOINTMENT,      // Patient missed scheduled appointment
    OVERDUE_FOLLOWUP,        // Follow-up is overdue
    COMPLICATION_REPORTED,   // Complication reported during check
    EMERGENCY                // Emergency situation
}
