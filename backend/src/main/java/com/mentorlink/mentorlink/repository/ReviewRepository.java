package com.mentorlink.mentorlink.repository;

import com.mentorlink.mentorlink.domain.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    boolean existsBySessionSessionId(Long sessionId);
    List<Review> findBySessionApplicationMentorMentorIdOrderByCreatedAtDesc(Long mentorId);
}
