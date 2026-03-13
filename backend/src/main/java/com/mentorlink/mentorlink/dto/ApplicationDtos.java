package com.mentorlink.mentorlink.dto;

import com.mentorlink.mentorlink.domain.ApplicationStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class ApplicationDtos {

    public record CreateApplicationRequest(
            @NotNull Long mentorId,
            @NotBlank String message,
            @NotNull LocalDateTime preferredAt,
            @NotNull LocalDateTime preferredEndAt,
            @NotNull @Min(30) @Max(240) Integer durationMinutes,
            @NotBlank String contact
    ) {
    }

    public record ApproveApplicationRequest(
            LocalDateTime scheduledAt
    ) {
    }

    public record RejectApplicationRequest(
            @NotBlank String reason
    ) {
    }

    public record ApplicationResponse(
            Long applicationId,
            Long mentorId,
            String mentorName,
            Long menteeUserId,
            String menteeName,
            String menteeEmail,
            ApplicationStatus status,
            String message,
            String contact,
            LocalDateTime preferredAt,
            LocalDateTime preferredEndAt,
            Integer durationMinutes,
            LocalDateTime scheduledAt,
            LocalDateTime scheduledEndAt,
            String rejectedReason,
            LocalDateTime createdAt
    ) {
    }
}
