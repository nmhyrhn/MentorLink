package com.mentorlink.mentorlink.domain;

public enum ApplicationStatus {
    PENDING,
    APPROVED,
    REJECTED,
    COMPLETED,
    /** 희망 시간까지 승인되지 않아 자동 취소된 경우 */
    CANCELLED
}
