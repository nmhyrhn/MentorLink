package com.mentorlink.domain.review.controller;

import com.mentorlink.domain.review.dto.CreateReviewRequest;
import com.mentorlink.domain.review.dto.ReviewResponse;
import com.mentorlink.domain.review.service.ReviewService;
import com.mentorlink.global.response.ApiResponse;
import com.mentorlink.global.security.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ApiResponse<ReviewResponse> create(@Valid @RequestBody CreateReviewRequest request) {
        return ApiResponse.success(reviewService.create(SecurityUtils.currentUser().getUserId(), request), "리뷰 작성 성공");
    }
}
