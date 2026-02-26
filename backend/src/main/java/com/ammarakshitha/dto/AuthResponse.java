package com.ammarakshitha.dto;

import com.ammarakshitha.model.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private Long expiresIn;
    private Long userId;
    private String name;
    private String email;
    private UserRole role;
    private String profileImageUrl;
}
