package com.mentorlink.domain.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import lombok.Getter;

@Getter
public class CreateApplicationRequest {
    @NotNull
    private Long mentorId;

    @NotBlank
    @Size(max = 500, message = "신청 메시지는 500자 이하여야 합니다.")
    private String message;

    @NotNull
    private LocalDateTime scheduledAt;
}
