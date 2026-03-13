package com.mentorlink.mentorlink.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class ReviewDtos {

    public record CreateReviewRequest(
            @NotNull Long sessionId,
            @NotNull @Min(1) @Max(5) Integer rating,
            String comment
    ) {
    }

    public record ReviewResponse(
            Long reviewId,
            Long sessionId,
            Long mentorId,
            String reviewerName,
            Integer rating,
            String comment,
            LocalDateTime createdAt
    ) {
    }
}
