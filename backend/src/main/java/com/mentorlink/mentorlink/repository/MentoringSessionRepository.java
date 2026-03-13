package com.mentorlink.mentorlink.repository;

import com.mentorlink.mentorlink.domain.MentoringSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MentoringSessionRepository extends JpaRepository<MentoringSession, Long> {
    boolean existsByApplicationApplicationId(Long applicationId);
    Optional<MentoringSession> findByApplicationApplicationId(Long applicationId);
    List<MentoringSession> findByApplicationMentorUserUserIdOrderByScheduledAtDesc(Long mentorUserId);
    List<MentoringSession> findByApplicationMenteeUserIdOrderByScheduledAtDesc(Long menteeUserId);
}
