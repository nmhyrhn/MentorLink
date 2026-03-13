package com.mentorlink.domain.mentor.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class CreateMentorProfileRequest {
    @NotBlank(message = "전문 분야는 필수입니다.")
    private String field;

    @NotBlank(message = "소개는 필수입니다.")
    private String bio;

    @NotNull
    @Min(value = 0, message = "경력 연차는 0 이상이어야 합니다.")
    private Integer careerYear;
}
