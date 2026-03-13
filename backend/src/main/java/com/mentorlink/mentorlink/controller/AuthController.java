package com.mentorlink.mentorlink.controller;

import com.mentorlink.mentorlink.dto.UserDtos;
import com.mentorlink.mentorlink.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    public UserDtos.UserResponse signUp(@RequestBody @Valid UserDtos.SignUpRequest request) {
        return userService.signUp(request);
    }

    @PostMapping("/login")
    public UserDtos.UserResponse login(@RequestBody @Valid UserDtos.LoginRequest request) {
        return userService.login(request);
    }
}
