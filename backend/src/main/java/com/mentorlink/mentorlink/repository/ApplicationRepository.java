package com.mentorlink.mentorlink.repository;

import com.mentorlink.mentorlink.domain.Application;
import com.mentorlink.mentorlink.domain.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByMenteeUserIdOrderByCreatedAtDesc(Long menteeUserId);
    List<Application> findByMentorUserUserIdOrderByCreatedAtDesc(Long mentorUserId);
    /** 들어온 신청: 해당 멘토에게 들어온 것 중 특정 상태만 (대기 중만 보여줄 때 사용) */
    List<Application> findByMentorUserUserIdAndStatusOrderByCreatedAtDesc(Long mentorUserId, ApplicationStatus status);
    /** 희망 시간이 지나서 자동 취소 대상인 PENDING 신청 조회 */
    List<Application> findByStatusAndPreferredAtBefore(ApplicationStatus status, LocalDateTime before);
    boolean existsByMentorMentorIdAndMenteeUserIdAndStatus(Long mentorId, Long menteeUserId, ApplicationStatus status);
    boolean existsByMenteeUserIdAndStatusIn(Long menteeUserId, Collection<ApplicationStatus> statuses);
    Optional<Application> findByApplicationIdAndMentorUserUserId(Long applicationId, Long mentorUserId);
    List<Application> findByMentorMentorIdAndStatusIn(Long mentorId, Collection<ApplicationStatus> statuses);
}
