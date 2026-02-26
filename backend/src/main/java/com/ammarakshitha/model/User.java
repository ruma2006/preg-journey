package com.ammarakshitha.model;

import com.ammarakshitha.model.enums.UserRole;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "passwordHash", "consultations", "assignedFollowUps", "performedHealthChecks"})
@Table(name = "users", indexes = {
    @Index(name = "idx_user_email", columnList = "email"),
    @Index(name = "idx_user_phone", columnList = "phone")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

    @NotBlank
    @Size(max = 100)
    @Column(nullable = false)
    private String name;

    @NotBlank
    @Email
    @Size(max = 100)
    @Column(nullable = false, unique = true)
    private String email;

    @NotBlank
    @Size(max = 15)
    @Column(nullable = false)
    private String phone;

    @NotBlank
    @Column(nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @Size(max = 100)
    private String department;

    @Size(max = 100)
    private String designation;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column
    private String profileImageUrl;

    // Consultations conducted by this user (if doctor)
    @OneToMany(mappedBy = "doctor", fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Consultation> consultations = new HashSet<>();

    // Follow-ups assigned to this user
    @OneToMany(mappedBy = "assignedTo", fetch = FetchType.LAZY)
    @Builder.Default
    private Set<FollowUp> assignedFollowUps = new HashSet<>();

    // Health checks performed by this user
    @OneToMany(mappedBy = "performedBy", fetch = FetchType.LAZY)
    @Builder.Default
    private Set<HealthCheck> performedHealthChecks = new HashSet<>();
}
