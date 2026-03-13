package com.mentorlink.domain.session.service;

import com.mentorlink.domain.application.entity.ApplicationStatus;
import com.mentorlink.domain.session.dto.SessionResponse;
import com.mentorlink.domain.session.entity.Session;
import com.mentorlink.domain.session.entity.SessionStatus;
import com.mentorlink.domain.session.repository.SessionRepository;
import com.mentorlink.global.exception.CustomException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final SessionRepository sessionRepository;

    public List<SessionResponse> getMySessions(Long userId) {
        return sessionRepository.findByUserId(userId).stream().map(this::toResponse).toList();
    }

    @Transactional
    public SessionResponse finish(Long userId, Long sessionId) {
        Session session = sessionRepository.findWithApplicationById(sessionId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "존재하지 않는 세션입니다."));

        if (!session.getApplication().getMentor().getId().equals(userId)) {
            throw new CustomException(HttpStatus.FORBIDDEN, "멘토만 세션 종료 처리가 가능합니다.");
        }
        if (session.getApplication().getStatus() != ApplicationStatus.APPROVED) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "승인된 신청의 세션만 접근 가능합니다.");
        }
        if (session.getStatus() != SessionStatus.SCHEDULED) {
            throw new CustomException(HttpStatus.CONFLICT, "이미 종료 또는 취소된 세션입니다.");
        }

        session.finish();
        session.getApplication().updateStatus(ApplicationStatus.COMPLETED);
        return toResponse(session);
    }

    public Session getSessionWithApplication(Long sessionId) {
        return sessionRepository.findWithApplicationById(sessionId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "존재하지 않는 세션입니다."));
    }

    private SessionResponse toResponse(Session session) {
        return SessionResponse.builder()
                .sessionId(session.getId())
                .applicationId(session.getApplication().getId())
                .mentorId(session.getApplication().getMentor().getId())
                .mentorName(session.getApplication().getMentor().getName())
                .menteeId(session.getApplication().getMentee().getId())
                .menteeName(session.getApplication().getMentee().getName())
                .scheduledAt(session.getScheduledAt())
                .status(session.getStatus())
                .build();
    }
}
