package com.mentorlink.mentorlink.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class MentorDtos {

    public record CreateMentorProfileRequest(
            @NotNull Long userId,
            String bio,
            @NotBlank String field,
            @NotNull @Min(0) Integer careerYear
    ) {
    }

    public record MentorResponse(
            Long mentorId,
            Long userId,
            String mentorName,
            String field,
            Integer careerYear,
            String bio
    ) {
    }
}
