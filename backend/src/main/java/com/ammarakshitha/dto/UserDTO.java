package com.ammarakshitha.dto;

import com.ammarakshitha.model.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private UserRole role;
    private String department;
    private String designation;
    private Boolean isActive;
    private String profileImageUrl;
    private LocalDateTime createdAt;
}
