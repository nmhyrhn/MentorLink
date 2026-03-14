package com.mentorlink.mentorlink.service;

import com.mentorlink.mentorlink.domain.Application;
import com.mentorlink.mentorlink.domain.ApplicationStatus;
import com.mentorlink.mentorlink.domain.MentorProfile;
import com.mentorlink.mentorlink.domain.MentoringSession;
import com.mentorlink.mentorlink.domain.Role;
import com.mentorlink.mentorlink.domain.SessionStatus;
import com.mentorlink.mentorlink.domain.User;
import com.mentorlink.mentorlink.dto.ApplicationDtos;
import com.mentorlink.mentorlink.exception.BadRequestException;
import com.mentorlink.mentorlink.exception.NotFoundException;
import com.mentorlink.mentorlink.repository.ApplicationRepository;
import com.mentorlink.mentorlink.repository.MentoringSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final MentoringSessionRepository sessionRepository;
    private final MentorService mentorService;
    private final UserService userService;

    @Transactional
    public ApplicationDtos.ApplicationResponse createApplication(Long currentUserId, ApplicationDtos.CreateApplicationRequest request) {
        MentorProfile mentor = mentorService.findById(request.mentorId());
        User mentee = userService.findById(currentUserId);

        if (mentee.getRole() != Role.MENTEE) {
            throw new BadRequestException("멘티 계정만 멘토링을 신청할 수 있습니다.");
        }

        if (mentor.getUser().getUserId().equals(currentUserId)) {
            throw new BadRequestException("본인에게는 멘토링을 신청할 수 없습니다.");
        }

        if (!request.preferredEndAt().equals(request.preferredAt().plusMinutes(request.durationMinutes()))) {
            throw new BadRequestException("예약 종료 시간은 시작 시간과 상담 시간을 기준으로 계산되어야 합니다.");
        }

        mentorService.validateReservation(mentor.getMentorId(), request.preferredAt(), request.durationMinutes());

        if (applicationRepository.existsByMentorMentorIdAndMenteeUserIdAndStatus(
                mentor.getMentorId(),
                mentee.getUserId(),
                ApplicationStatus.PENDING
        )) {
            throw new BadRequestException("이미 같은 멘토에게 대기 중인 신청이 있습니다.");
        }

        Application application = applicationRepository.save(Application.builder()
                .mentor(mentor)
                .mentee(mentee)
                .status(ApplicationStatus.PENDING)
                .message(request.message())
                .contact(request.contact())
                .preferredAt(request.preferredAt())
                .preferredEndAt(request.preferredEndAt())
                .durationMinutes(request.durationMinutes())
                .build());

        return toResponse(application);
    }

    @Transactional
    public ApplicationDtos.ApplicationResponse approve(Long currentUserId, Long applicationId, ApplicationDtos.ApproveApplicationRequest request) {
        Application application = applicationRepository.findByApplicationIdAndMentorUserUserId(applicationId, currentUserId)
                .orElseThrow(() -> new NotFoundException("신청 정보를 찾을 수 없습니다."));

        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new BadRequestException("대기 중인 신청만 승인할 수 있습니다.");
        }

        if (sessionRepository.existsByApplicationApplicationId(applicationId)) {
            throw new BadRequestException("이미 세션이 생성된 신청입니다.");
        }

        LocalDateTime scheduledAt = request.scheduledAt() != null ? request.scheduledAt() : application.getPreferredAt();
        mentorService.validateReservation(
                application.getMentor().getMentorId(),
                scheduledAt,
                application.getDurationMinutes(),
                application.getApplicationId()
        );

        application.approve();

        sessionRepository.save(MentoringSession.builder()
                .application(application)
                .scheduledAt(scheduledAt)
                .endAt(scheduledAt.plusMinutes(application.getDurationMinutes()))
                .durationMinutes(application.getDurationMinutes())
                .status(SessionStatus.SCHEDULED)
                .build());

        return toResponse(application);
    }

    @Transactional
    public ApplicationDtos.ApplicationResponse reject(Long currentUserId, Long applicationId, ApplicationDtos.RejectApplicationRequest request) {
        Application application = applicationRepository.findByApplicationIdAndMentorUserUserId(applicationId, currentUserId)
                .orElseThrow(() -> new NotFoundException("신청 정보를 찾을 수 없습니다."));

        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new BadRequestException("대기 중인 신청만 거절할 수 있습니다.");
        }

        application.reject(request.reason());
        return toResponse(application);
    }

    @Transactional(readOnly = true)
    public List<ApplicationDtos.ApplicationResponse> getMySentApplications(Long currentUserId) {
        return applicationRepository.findByMenteeUserIdOrderByCreatedAtDesc(currentUserId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public List<ApplicationDtos.ApplicationResponse> getMyReceivedApplications(Long currentUserId) {
        LocalDateTime now = LocalDateTime.now();
        List<Application> expired = applicationRepository.findByStatusAndPreferredAtBefore(ApplicationStatus.PENDING, now);
        for (Application app : expired) {
            app.cancel("희망 시간까지 승인이 완료되지 않아 자동 취소되었습니다.");
        }
        if (!expired.isEmpty()) {
            applicationRepository.saveAll(expired);
        }
        return applicationRepository.findByMentorUserUserIdAndStatusOrderByCreatedAtDesc(currentUserId, ApplicationStatus.PENDING)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Application findById(Long applicationId) {
        return applicationRepository.findById(applicationId)
                .orElseThrow(() -> new NotFoundException("신청 정보를 찾을 수 없습니다."));
    }

    private ApplicationDtos.ApplicationResponse toResponse(Application application) {
        MentoringSession session = sessionRepository.findByApplicationApplicationId(application.getApplicationId()).orElse(null);

        return new ApplicationDtos.ApplicationResponse(
                application.getApplicationId(),
                application.getMentor().getMentorId(),
                application.getMentor().getUser().getName(),
                application.getMentee().getUserId(),
                application.getMentee().getName(),
                application.getMentee().getEmail(),
                application.getStatus(),
                application.getMessage(),
                application.getContact(),
                application.getPreferredAt(),
                application.getPreferredEndAt(),
                application.getDurationMinutes(),
                session != null ? session.getScheduledAt() : null,
                session != null ? session.getEndAt() : null,
                application.getRejectedReason(),
                application.getCreatedAt()
        );
    }
}
