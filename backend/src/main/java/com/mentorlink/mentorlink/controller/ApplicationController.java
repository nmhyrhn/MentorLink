package com.mentorlink.mentorlink.controller;

import com.mentorlink.mentorlink.dto.ApplicationDtos;
import com.mentorlink.mentorlink.security.CustomUserDetails;
import com.mentorlink.mentorlink.service.ApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApplicationDtos.ApplicationResponse createApplication(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody @Valid ApplicationDtos.CreateApplicationRequest request
    ) {
        return applicationService.createApplication(userDetails.userId(), request);
    }

    @PatchMapping("/{id}/approve")
    public ApplicationDtos.ApplicationResponse approveApplication(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id,
            @RequestBody @Valid ApplicationDtos.ApproveApplicationRequest request
    ) {
        return applicationService.approve(userDetails.userId(), id, request);
    }

    @PatchMapping("/{id}/reject")
    public ApplicationDtos.ApplicationResponse rejectApplication(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id,
            @RequestBody @Valid ApplicationDtos.RejectApplicationRequest request
    ) {
        return applicationService.reject(userDetails.userId(), id, request);
    }

    @GetMapping("/me/sent")
    public List<ApplicationDtos.ApplicationResponse> getMySentApplications(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return applicationService.getMySentApplications(userDetails.userId());
    }

    @GetMapping("/me/received")
    public List<ApplicationDtos.ApplicationResponse> getMyReceivedApplications(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return applicationService.getMyReceivedApplications(userDetails.userId());
    }
}
