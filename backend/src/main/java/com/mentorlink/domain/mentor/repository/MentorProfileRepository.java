package com.mentorlink.domain.mentor.repository;

import com.mentorlink.domain.mentor.entity.MentorProfile;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MentorProfileRepository extends JpaRepository<MentorProfile, Long> {
    Optional<MentorProfile> findByUserId(Long userId);
}
