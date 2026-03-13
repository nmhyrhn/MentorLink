package com.mentorlink.domain.mentor.entity;

import com.mentorlink.domain.user.entity.User;
import com.mentorlink.global.entity.BaseTimeEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 멘토의 전문 정보(프로필) 엔티티.
 */
@Getter
@Entity
@Table(name = "mentor_profiles")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MentorProfile extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, length = 100)
    private String field;

    @Column(nullable = false, length = 500)
    private String bio;

    @Column(nullable = false)
    private Integer careerYear;

    @Builder
    public MentorProfile(User user, String field, String bio, Integer careerYear) {
        this.user = user;
        this.field = field;
        this.bio = bio;
        this.careerYear = careerYear;
    }
}
