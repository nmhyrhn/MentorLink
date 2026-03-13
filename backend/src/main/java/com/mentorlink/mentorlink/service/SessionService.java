package com.mentorlink.mentorlink.service;

import com.mentorlink.mentorlink.domain.Application;
import com.mentorlink.mentorlink.domain.MentoringSession;
import com.mentorlink.mentorlink.domain.Role;
import com.mentorlink.mentorlink.domain.SessionStatus;
import com.mentorlink.mentorlink.domain.User;
import com.mentorlink.mentorlink.dto.SessionDtos;
import com.mentorlink.mentorlink.exception.BadRequestException;
import com.mentorlink.mentorlink.exception.NotFoundException;
import com.mentorlink.mentorlink.repository.MentoringSessionRepository;
import com.mentorlink.mentorlink.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final MentoringSessionRepository sessionRepository;
    private final ReviewRepository reviewRepository;

    @Transactional(readOnly = true)
    public MentoringSession findById(Long sessionId) {
        return sessionRepository.findById(sessionId)
                .orElseThrow(() -> new NotFoundException("세션을 찾을 수 없습니다."));
    }

    @Transactional(readOnly = true)
    public List<SessionDtos.SessionResponse> getMySessions(User currentUser) {
        List<MentoringSession> mentorSessions = currentUser.getRole() == Role.MENTOR
                ? sessionRepository.findByApplicationMentorUserUserIdOrderByScheduledAtDesc(currentUser.getUserId())
                : List.of();
        List<MentoringSession> menteeSessions = sessionRepository.findByApplicationMenteeUserIdOrderByScheduledAtDesc(currentUser.getUserId());

        return List.copyOf(
                java.util.stream.Stream.concat(mentorSessions.stream(), menteeSessions.stream())
                        .collect(java.util.stream.Collectors.toMap(
                                MentoringSession::getSessionId,
                                session -> session,
                                (left, right) -> left
                        ))
                        .values()
                        .stream()
                        .sorted(Comparator.comparing(MentoringSession::getScheduledAt).reversed())
                        .map(this::toResponse)
                        .toList()
        );
    }

    @Transactional
    public SessionDtos.SessionResponse completeSession(User currentUser, Long sessionId) {
        MentoringSession session = findById(sessionId);
        Application application = session.getApplication();
        boolean participant = application.getMentee().getUserId().equals(currentUser.getUserId())
                || application.getMentor().getUser().getUserId().equals(currentUser.getUserId());

        if (!participant) {
            throw new BadRequestException("세션 참여자만 세션 완료 처리를 할 수 있습니다.");
        }

        if (session.getStatus() != SessionStatus.SCHEDULED) {
            throw new BadRequestException("예정된 세션만 완료 처리할 수 있습니다.");
        }

        session.complete();
        application.complete();
        return toResponse(session);
    }

    private SessionDtos.SessionResponse toResponse(MentoringSession session) {
        Application app = session.getApplication();
        return new SessionDtos.SessionResponse(
                session.getSessionId(),
                app.getApplicationId(),
                app.getMentor().getMentorId(),
                app.getMentor().getUser().getName(),
                app.getMentee().getUserId(),
                app.getMentee().getName(),
                app.getContact(),
                session.getScheduledAt(),
                session.getEndAt(),
                session.getDurationMinutes(),
                session.getStatus(),
                reviewRepository.existsBySessionSessionId(session.getSessionId())
        );
    }
}
