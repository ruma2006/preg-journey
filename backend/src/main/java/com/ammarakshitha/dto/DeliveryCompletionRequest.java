package com.ammarakshitha.dto;

import com.ammarakshitha.model.enums.DeliveryOutcome;
import com.ammarakshitha.model.enums.DeliveryType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@SuppressWarnings("unused")
public class DeliveryCompletionRequest {

    @NotNull(message = "Delivery outcome is required")
    private DeliveryOutcome deliveryOutcome;

    @NotNull(message = "Delivery type is required")
    private DeliveryType deliveryType;

    @NotNull(message = "Delivery date is required")
    private LocalDate deliveryDate;

    private String deliveryNotes;

    // Legacy fields (kept for backward compatibility)
    private Double babyWeight;  // in kg (deprecated - use babies list)

    private String babyGender;  // Male, Female (deprecated - use babies list)

    private String deliveryHospital;

    // Multiple babies support
    @Min(1)
    @Max(4)
    private Integer numberOfBabies = 1;  // Number of babies delivered
    
    private List<BabyDTO> babies = new ArrayList<>();  // Information for each baby

    // Mortality information (required if outcome involves mortality)
    private LocalDate mortalityDate;

    private String mortalityCause;

    private String mortalityNotes;
}
