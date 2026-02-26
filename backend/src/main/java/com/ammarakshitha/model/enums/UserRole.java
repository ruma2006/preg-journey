package com.ammarakshitha.model.enums;

public enum UserRole {
    ADMIN,           // Collector / District Admin - Full access
    MEDICAL_OFFICER, // Concerned Medical Officer - View reports, manage doctors
    MCH_OFFICER,     // MCH Programme Officer - Maternal health analytics
    DOCTOR,          // Doctors - Consultations, treatment plans
    HELP_DESK        // Help desk staff - Registration, checklist, follow-ups
}
