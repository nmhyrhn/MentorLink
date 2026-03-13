package com.mentorlink.mentorlink.service;

import com.mentorlink.mentorlink.domain.*;
import com.mentorlink.mentorlink.dto.ApplicationDtos;
import com.mentorlink.mentorlink.exception.BadRequestException;
import com.mentorlink.mentorlink.exception.NotFoundException;
import com.mentorlink.mentorlink.repository.ApplicationRepository;
import com.mentorlink.mentorlink.repository.MentoringSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final MentoringSessionRepository sessionRepository;
    private final MentorService mentorService;
    private final UserService userService;

    @Transactional
    public ApplicationDtos.ApplicationResponse createApplication(ApplicationDtos.CreateApplicationRequest request) {
        MentorProfile mentor = mentorService.findById(request.mentorId());
        User mentee = userService.findById(request.menteeUserId());

        if (mentee.getRole() != Role.MENTEE) {
            throw new BadRequestException("멘티 역할 사용자만 신청할 수 있습니다.");
        }

        Application application = applicationRepository.save(Application.builder()
                .mentor(mentor)
                .mentee(mentee)
                .status(ApplicationStatus.PENDING)
                .message(request.message())
                .build());

        return toResponse(application);
    }

    @Transactional
    public ApplicationDtos.ApplicationResponse approve(Long applicationId, ApplicationDtos.ApproveApplicationRequest request) {
        Application application = findById(applicationId);

        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new BadRequestException("PENDING 상태만 승인할 수 있습니다.");
        }

        application.setStatus(ApplicationStatus.APPROVED);

        sessionRepository.save(MentoringSession.builder()
                .application(application)
                .scheduledAt(request.scheduledAt())
                .status(SessionStatus.SCHEDULED)
                .build());

        // TODO: 알림 전송 연동
        return toResponse(application);
    }

    @Transactional(readOnly = true)
    public Application findById(Long applicationId) {
        return applicationRepository.findById(applicationId)
                .orElseThrow(() -> new NotFoundException("신청 정보를 찾을 수 없습니다."));
    }

    private ApplicationDtos.ApplicationResponse toResponse(Application application) {
        return new ApplicationDtos.ApplicationResponse(
                application.getApplicationId(),
                application.getMentor().getMentorId(),
                application.getMentee().getUserId(),
                application.getStatus(),
                application.getMessage()
        );
    }
}
