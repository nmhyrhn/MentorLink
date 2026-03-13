package com.mentorlink.mentorlink.security;

import com.mentorlink.mentorlink.domain.Role;
import com.mentorlink.mentorlink.domain.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public record CustomUserDetails(
        Long userId,
        String email,
        String password,
        Role role
) implements UserDetails {

    public static CustomUserDetails from(User user) {
        return new CustomUserDetails(user.getUserId(), user.getEmail(), user.getPassword(), user.getRole());
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }
}
