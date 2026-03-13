package com.mentorlink.mentorlink.repository;

import com.mentorlink.mentorlink.domain.MentoringSession;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MentoringSessionRepository extends JpaRepository<MentoringSession, Long> {
}
