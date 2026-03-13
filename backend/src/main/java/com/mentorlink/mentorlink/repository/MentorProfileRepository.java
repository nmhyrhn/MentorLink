package com.mentorlink.mentorlink.repository;

import com.mentorlink.mentorlink.domain.MentorProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MentorProfileRepository extends JpaRepository<MentorProfile, Long> {
    Optional<MentorProfile> findByUserUserId(Long userId);
}
