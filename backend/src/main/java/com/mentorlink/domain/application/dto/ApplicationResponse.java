package com.mentorlink.domain.application.dto;

import com.mentorlink.domain.application.entity.ApplicationStatus;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ApplicationResponse {
    private Long applicationId;
    private Long mentorId;
    private String mentorName;
    private Long menteeId;
    private String menteeName;
    private String message;
    private LocalDateTime preferredScheduledAt;
    private ApplicationStatus status;
    private LocalDateTime createdAt;
}
