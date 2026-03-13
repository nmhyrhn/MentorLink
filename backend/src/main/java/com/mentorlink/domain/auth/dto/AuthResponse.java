package com.mentorlink.domain.auth.dto;

import com.mentorlink.domain.user.entity.UserRole;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AuthResponse {
    private Long userId;
    private String name;
    private String email;
    private UserRole role;
    private String accessToken;
}
