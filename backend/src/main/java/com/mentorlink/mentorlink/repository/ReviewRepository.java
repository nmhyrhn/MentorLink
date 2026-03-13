package com.mentorlink.mentorlink.repository;

import com.mentorlink.mentorlink.domain.Review;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<Review, Long> {
}
