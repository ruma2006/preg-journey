package com.ammarakshitha.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FollowUpRequest {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Assigned user ID is required")
    private Long assignedToId;

    @NotNull(message = "Scheduled date is required")
    private LocalDate scheduledDate;

    private String notes;
}
