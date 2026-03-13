package com.mentorlink.mentorlink.dto;

import com.mentorlink.mentorlink.domain.SessionStatus;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class SessionDtos {

    public record CreateSessionRequest(
            @NotNull Long applicationId,
            @NotNull LocalDateTime scheduledAt
    ) {
    }

    public record SessionResponse(
            Long sessionId,
            Long applicationId,
            LocalDateTime scheduledAt,
            SessionStatus status
    ) {
    }
}
