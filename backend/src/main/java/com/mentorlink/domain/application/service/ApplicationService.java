package com.mentorlink.domain.application.service;

import com.mentorlink.domain.application.dto.ApplicationResponse;
import com.mentorlink.domain.application.dto.CreateApplicationRequest;
import com.mentorlink.domain.application.entity.Application;
import com.mentorlink.domain.application.entity.ApplicationStatus;
import com.mentorlink.domain.application.repository.ApplicationRepository;
import com.mentorlink.domain.session.entity.Session;
import com.mentorlink.domain.session.entity.SessionStatus;
import com.mentorlink.domain.session.repository.SessionRepository;
import com.mentorlink.domain.user.entity.User;
import com.mentorlink.domain.user.entity.UserRole;
import com.mentorlink.domain.user.repository.UserRepository;
import com.mentorlink.global.exception.CustomException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 신청 생성/조회/승인/거절 비즈니스 로직 처리.
 */
@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final SessionRepository sessionRepository;

    @Transactional
    public ApplicationResponse create(Long menteeId, CreateApplicationRequest request) {
        User mentee = findUser(menteeId, "존재하지 않는 멘티입니다.");
        if (mentee.getRole() != UserRole.MENTEE) {
            throw new CustomException(HttpStatus.FORBIDDEN, "멘티만 신청할 수 있습니다.");
        }

        User mentor = findUser(request.getMentorId(), "존재하지 않는 멘토입니다.");
        if (mentor.getRole() != UserRole.MENTOR) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "신청 대상은 멘토여야 합니다.");
        }

        Application app = applicationRepository.save(Application.builder()
                .mentor(mentor)
                .mentee(mentee)
                .message(request.getMessage())
                .preferredScheduledAt(request.getScheduledAt())
                .status(ApplicationStatus.PENDING)
                .build());

        return toResponse(app);
    }

    public List<ApplicationResponse> getSent(Long menteeId) {
        return applicationRepository.findSentByMenteeId(menteeId).stream().map(this::toResponse).toList();
    }

    public List<ApplicationResponse> getReceived(Long mentorId) {
        return applicationRepository.findReceivedByMentorId(mentorId).stream().map(this::toResponse).toList();
    }

    @Transactional
    public ApplicationResponse approve(Long mentorId, Long applicationId) {
        Application app = applicationRepository.findWithUsersById(applicationId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "존재하지 않는 신청입니다."));

        validateMentorOwner(mentorId, app);
        validatePending(app);

        app.updateStatus(ApplicationStatus.APPROVED);
        sessionRepository.save(Session.builder()
                .application(app)
                .scheduledAt(app.getPreferredScheduledAt())
                .status(SessionStatus.SCHEDULED)
                .build());

        return toResponse(app);
    }

    @Transactional
    public ApplicationResponse reject(Long mentorId, Long applicationId) {
        Application app = applicationRepository.findWithUsersById(applicationId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "존재하지 않는 신청입니다."));

        validateMentorOwner(mentorId, app);
        validatePending(app);
        app.updateStatus(ApplicationStatus.REJECTED);
        return toResponse(app);
    }

    private void validatePending(Application app) {
        if (app.getStatus() != ApplicationStatus.PENDING) {
            throw new CustomException(HttpStatus.CONFLICT, "이미 처리된 신청입니다.");
        }
    }

    private void validateMentorOwner(Long mentorId, Application app) {
        if (!app.getMentor().getId().equals(mentorId)) {
            throw new CustomException(HttpStatus.FORBIDDEN, "본인 신청만 처리할 수 있습니다.");
        }
    }

    private User findUser(Long id, String message) {
        return userRepository.findById(id).orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, message));
    }

    private ApplicationResponse toResponse(Application app) {
        return ApplicationResponse.builder()
                .applicationId(app.getId())
                .mentorId(app.getMentor().getId())
                .mentorName(app.getMentor().getName())
                .menteeId(app.getMentee().getId())
                .menteeName(app.getMentee().getName())
                .message(app.getMessage())
                .preferredScheduledAt(app.getPreferredScheduledAt())
                .status(app.getStatus())
                .createdAt(app.getCreatedAt())
                .build();
    }
}
