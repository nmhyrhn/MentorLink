package com.mentorlink.domain.mentor.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MentorResponse {
    private Long mentorId;
    private String mentorName;
    private String field;
    private String bio;
    private Integer careerYear;
}
