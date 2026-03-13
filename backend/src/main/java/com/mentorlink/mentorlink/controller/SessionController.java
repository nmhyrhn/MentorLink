package com.mentorlink.mentorlink.controller;

import com.mentorlink.mentorlink.dto.SessionDtos;
import com.mentorlink.mentorlink.security.CustomUserDetails;
import com.mentorlink.mentorlink.service.SessionService;
import com.mentorlink.mentorlink.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;
    private final UserService userService;

    @GetMapping("/me")
    public List<SessionDtos.SessionResponse> getMySessions(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return sessionService.getMySessions(userService.findById(userDetails.userId()));
    }

    @PatchMapping("/{id}/complete")
    public SessionDtos.SessionResponse completeSession(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id
    ) {
        return sessionService.completeSession(userService.findById(userDetails.userId()), id);
    }
}
