package com.mentorlink.mentorlink.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

public class MentorDtos {

    public record AvailabilityRuleRequest(
            @NotNull DayOfWeek dayOfWeek,
            @NotNull @Pattern(regexp = "^(?:[01]\\d|2[0-3]):(?:00|30)$") String startTime,
            @NotNull @Pattern(regexp = "^(?:[01]\\d|2[0-3]):(?:00|30)$") String endTime
    ) {
    }

    public record UpsertMentorProfileRequest(
            @NotBlank String bio,
            @NotBlank String field,
            @NotNull @Min(0) Integer careerYear,
            @NotEmpty List<String> expertise,
            @NotEmpty List<AvailabilityRuleRequest> availabilityRules
    ) {
    }

    public record AvailabilityRuleResponse(
            DayOfWeek dayOfWeek,
            String label,
            LocalTime startTime,
            LocalTime endTime
    ) {
    }

    public record AvailableSlotResponse(
            LocalDateTime startAt,
            LocalDateTime endAt,
            @Min(30) @Max(240) Integer maxDurationMinutes,
            List<Integer> durationOptions
    ) {
    }

    public record MentorReviewResponse(
            Long reviewId,
            Long sessionId,
            String reviewerName,
            Integer rating,
            String comment,
            LocalDateTime createdAt
    ) {
    }

    public record MentorResponse(
            Long mentorId,
            Long userId,
            String mentorName,
            String field,
            Integer careerYear,
            String bio,
            String imageUrl,
            List<String> expertise,
            List<AvailabilityRuleResponse> availabilityRules,
            Double averageRating,
            Integer reviewCount,
            List<MentorReviewResponse> reviews
    ) {
    }
}
