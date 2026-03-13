package com.mentorlink.mentorlink.controller;

import com.mentorlink.mentorlink.dto.SessionDtos;
import com.mentorlink.mentorlink.service.SessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SessionDtos.SessionResponse createSession(@RequestBody @Valid SessionDtos.CreateSessionRequest request) {
        return sessionService.createSession(request);
    }
}
