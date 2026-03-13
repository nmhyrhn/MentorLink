package com.mentorlink.domain.review.dto;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ReviewResponse {
    private Long reviewId;
    private Long sessionId;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}
