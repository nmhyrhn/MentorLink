package com.mentorlink.mentorlink.controller;

import com.mentorlink.mentorlink.dto.ReviewDtos;
import com.mentorlink.mentorlink.security.CustomUserDetails;
import com.mentorlink.mentorlink.service.ReviewService;
import com.mentorlink.mentorlink.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final UserService userService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReviewDtos.ReviewResponse createReview(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody @Valid ReviewDtos.CreateReviewRequest request
    ) {
        return reviewService.createReview(userService.findById(userDetails.userId()), request);
    }
}
