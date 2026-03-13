package com.mentorlink.domain.review.repository;

import com.mentorlink.domain.review.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    boolean existsBySessionId(Long sessionId);
}
