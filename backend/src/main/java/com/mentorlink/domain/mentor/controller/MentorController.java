package com.mentorlink.domain.mentor.controller;

import com.mentorlink.domain.mentor.dto.CreateMentorProfileRequest;
import com.mentorlink.domain.mentor.dto.MentorResponse;
import com.mentorlink.domain.mentor.service.MentorService;
import com.mentorlink.global.response.ApiResponse;
import com.mentorlink.global.security.SecurityUtils;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/mentors")
public class MentorController {

    private final MentorService mentorService;

    @PostMapping("/profile")
    public ApiResponse<MentorResponse> createProfile(@Valid @RequestBody CreateMentorProfileRequest request) {
        return ApiResponse.success(mentorService.createProfile(SecurityUtils.currentUser().getUserId(), request), "멘토 프로필 등록 성공");
    }

    @GetMapping
    public ApiResponse<List<MentorResponse>> getMentors() {
        return ApiResponse.success(mentorService.getMentorList(), "멘토 목록 조회 성공");
    }

    @GetMapping("/{mentorId}")
    public ApiResponse<MentorResponse> getMentor(@PathVariable Long mentorId) {
        return ApiResponse.success(mentorService.getMentorDetail(mentorId), "멘토 상세 조회 성공");
    }
}
