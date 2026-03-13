package com.mentorlink.mentorlink.controller;

import com.mentorlink.mentorlink.dto.ReviewDtos;
import com.mentorlink.mentorlink.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReviewDtos.ReviewResponse createReview(@RequestBody @Valid ReviewDtos.CreateReviewRequest request) {
        return reviewService.createReview(request);
    }
}
