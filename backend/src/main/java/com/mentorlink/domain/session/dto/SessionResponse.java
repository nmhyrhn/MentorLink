package com.mentorlink.domain.session.dto;

import com.mentorlink.domain.session.entity.SessionStatus;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SessionResponse {
    private Long sessionId;
    private Long applicationId;
    private Long mentorId;
    private String mentorName;
    private Long menteeId;
    private String menteeName;
    private LocalDateTime scheduledAt;
    private SessionStatus status;
}
