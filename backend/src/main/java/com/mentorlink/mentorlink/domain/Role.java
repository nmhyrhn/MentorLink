package com.mentorlink.mentorlink.domain;

public enum Role {
    MENTOR,
    MENTEE;

    public boolean canMentor() {
        return this == MENTOR;
    }

    public boolean canMentee() {
        return this == MENTEE;
    }
}
