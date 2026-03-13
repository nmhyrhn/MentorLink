package com.mentorlink.mentorlink.controller;

import com.mentorlink.mentorlink.dto.ApplicationDtos;
import com.mentorlink.mentorlink.service.ApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApplicationDtos.ApplicationResponse createApplication(@RequestBody @Valid ApplicationDtos.CreateApplicationRequest request) {
        return applicationService.createApplication(request);
    }

    @PatchMapping("/{id}/approve")
    public ApplicationDtos.ApplicationResponse approveApplication(
            @PathVariable Long id,
            @RequestBody @Valid ApplicationDtos.ApproveApplicationRequest request
    ) {
        return applicationService.approve(id, request);
    }
}
