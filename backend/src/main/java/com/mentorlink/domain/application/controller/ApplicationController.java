package com.mentorlink.domain.application.controller;

import com.mentorlink.domain.application.dto.ApplicationResponse;
import com.mentorlink.domain.application.dto.CreateApplicationRequest;
import com.mentorlink.domain.application.service.ApplicationService;
import com.mentorlink.global.response.ApiResponse;
import com.mentorlink.global.security.SecurityUtils;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping
    public ApiResponse<ApplicationResponse> create(@Valid @RequestBody CreateApplicationRequest request) {
        return ApiResponse.success(applicationService.create(SecurityUtils.currentUser().getUserId(), request), "신청 생성 성공");
    }

    @GetMapping("/sent")
    public ApiResponse<List<ApplicationResponse>> sent() {
        return ApiResponse.success(applicationService.getSent(SecurityUtils.currentUser().getUserId()), "보낸 신청 조회 성공");
    }

    @GetMapping("/received")
    public ApiResponse<List<ApplicationResponse>> received() {
        return ApiResponse.success(applicationService.getReceived(SecurityUtils.currentUser().getUserId()), "받은 신청 조회 성공");
    }

    @PatchMapping("/{applicationId}/approve")
    public ApiResponse<ApplicationResponse> approve(@PathVariable Long applicationId) {
        return ApiResponse.success(applicationService.approve(SecurityUtils.currentUser().getUserId(), applicationId), "신청 승인 성공");
    }

    @PatchMapping("/{applicationId}/reject")
    public ApiResponse<ApplicationResponse> reject(@PathVariable Long applicationId) {
        return ApiResponse.success(applicationService.reject(SecurityUtils.currentUser().getUserId(), applicationId), "신청 거절 성공");
    }
}
