package com.mentorlink.domain.session.controller;

import com.mentorlink.domain.session.dto.SessionResponse;
import com.mentorlink.domain.session.service.SessionService;
import com.mentorlink.global.response.ApiResponse;
import com.mentorlink.global.security.SecurityUtils;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/sessions")
public class SessionController {

    private final SessionService sessionService;

    @GetMapping
    public ApiResponse<List<SessionResponse>> getMine() {
        return ApiResponse.success(sessionService.getMySessions(SecurityUtils.currentUser().getUserId()), "세션 목록 조회 성공");
    }

    @PatchMapping("/{sessionId}/finish")
    public ApiResponse<SessionResponse> finish(@PathVariable Long sessionId) {
        return ApiResponse.success(sessionService.finish(SecurityUtils.currentUser().getUserId(), sessionId), "세션 종료 성공");
    }
}
