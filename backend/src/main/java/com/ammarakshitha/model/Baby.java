package com.ammarakshitha.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "babies")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Baby {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @JsonIgnoreProperties({"babies", "healthChecks", "consultations", "followUps", "riskAlerts"})
    @NotNull
    private Patient patient;

    @Column(name = "gender")
    @Size(max = 10)
    @NotBlank
    private String gender;  // Male, Female

    @Column(name = "weight")
    @DecimalMin("0.1")
    @Max(10)
    @NotNull
    private Double weight;  // in kg, range 0-10

    @Column(name = "birth_order", nullable = false)
    @NotNull
    @Min(1)
    private Integer birthOrder;  // 1 for first baby, 2 for second, etc.

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
