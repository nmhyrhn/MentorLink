package com.mentorlink.mentorlink.dto;

import com.mentorlink.mentorlink.domain.ApplicationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class ApplicationDtos {

    public record CreateApplicationRequest(
            @NotNull Long mentorId,
            @NotNull Long menteeUserId,
            @NotBlank String message
    ) {
    }

    public record ApproveApplicationRequest(
            @NotNull LocalDateTime scheduledAt
    ) {
    }

    public record ApplicationResponse(
            Long applicationId,
            Long mentorId,
            Long menteeUserId,
            ApplicationStatus status,
            String message
    ) {
    }
}
