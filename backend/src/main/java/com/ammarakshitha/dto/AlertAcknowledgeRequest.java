package com.ammarakshitha.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertAcknowledgeRequest {
    private String notes;
    private String actionTaken;
}
