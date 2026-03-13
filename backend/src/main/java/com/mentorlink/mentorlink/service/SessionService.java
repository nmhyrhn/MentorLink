package com.mentorlink.mentorlink.service;

import com.mentorlink.mentorlink.domain.*;
import com.mentorlink.mentorlink.dto.SessionDtos;
import com.mentorlink.mentorlink.exception.BadRequestException;
import com.mentorlink.mentorlink.exception.NotFoundException;
import com.mentorlink.mentorlink.repository.MentoringSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final MentoringSessionRepository sessionRepository;
    private final ApplicationService applicationService;

    @Transactional
    public SessionDtos.SessionResponse createSession(SessionDtos.CreateSessionRequest request) {
        Application application = applicationService.findById(request.applicationId());

        if (application.getStatus() != ApplicationStatus.APPROVED) {
            throw new BadRequestException("승인된 신청(APPROVED)만 세션을 생성할 수 있습니다.");
        }

        MentoringSession session = sessionRepository.save(MentoringSession.builder()
                .application(application)
                .scheduledAt(request.scheduledAt())
                .status(SessionStatus.SCHEDULED)
                .build());

        return toResponse(session);
    }

    @Transactional(readOnly = true)
    public MentoringSession findById(Long sessionId) {
        return sessionRepository.findById(sessionId)
                .orElseThrow(() -> new NotFoundException("세션을 찾을 수 없습니다."));
    }

    private SessionDtos.SessionResponse toResponse(MentoringSession session) {
        return new SessionDtos.SessionResponse(
                session.getSessionId(),
                session.getApplication().getApplicationId(),
                session.getScheduledAt(),
                session.getStatus());
    }
}
