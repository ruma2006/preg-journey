package com.ammarakshitha.model.enums;

public enum DeliveryOutcome {
    PENDING,           // Delivery not yet completed
    SUCCESSFUL,        // Both mother and baby healthy
    MOTHER_MORTALITY,  // Mother passed away
    BABY_MORTALITY,    // Baby passed away
    BOTH_MORTALITY     // Both mother and baby passed away
}
