package com.mentorlink.mentorlink.repository;

import com.mentorlink.mentorlink.domain.Application;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
}
