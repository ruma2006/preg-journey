package com.ammarakshitha.dto;

import com.ammarakshitha.model.enums.DeliveryOutcome;
import com.ammarakshitha.model.enums.DeliveryType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class DeliveryCompletionRequest {

    @NotNull(message = "Delivery outcome is required")
    private DeliveryOutcome deliveryOutcome;

    @NotNull(message = "Delivery type is required")
    private DeliveryType deliveryType;

    @NotNull(message = "Delivery date is required")
    private LocalDate deliveryDate;

    private String deliveryNotes;

    private Double babyWeight;  // in kg

    private String babyGender;  // Male, Female

    private String deliveryHospital;

    // Mortality information (required if outcome involves mortality)
    private LocalDate mortalityDate;

    private String mortalityCause;

    private String mortalityNotes;
}
