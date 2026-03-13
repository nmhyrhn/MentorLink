package com.mentorlink.mentorlink.dto;

import com.mentorlink.mentorlink.domain.SessionStatus;

import java.time.LocalDateTime;

public class SessionDtos {

    public record SessionResponse(
            Long sessionId,
            Long applicationId,
            Long mentorId,
            String mentorName,
            Long menteeUserId,
            String menteeName,
            String menteeContact,
            LocalDateTime scheduledAt,
            LocalDateTime endAt,
            Integer durationMinutes,
            SessionStatus status,
            boolean reviewSubmitted
    ) {
    }
}
