package com.ammarakshitha.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuppressWarnings("unused")
public class BabyDTO {
    
    @Size(max = 10)
    @NotBlank
    private String gender;  // Male, Female
    
    @DecimalMin("0.1")
    @Max(10)
    @NotNull
    private Double weight;  // in kg
    
    private Integer birthOrder;  // 1, 2, 3, etc.
}
