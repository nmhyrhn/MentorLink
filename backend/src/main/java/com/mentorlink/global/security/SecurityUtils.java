package com.mentorlink.global.security;

import com.mentorlink.global.exception.CustomException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtils {

    public static UserPrincipal currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal userPrincipal)) {
            throw new CustomException(HttpStatus.UNAUTHORIZED, "인증 정보가 없습니다.");
        }
        return userPrincipal;
    }
}
