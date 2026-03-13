package com.mentorlink.mentorlink.service;

import com.mentorlink.mentorlink.domain.MentorProfile;
import com.mentorlink.mentorlink.domain.Role;
import com.mentorlink.mentorlink.domain.User;
import com.mentorlink.mentorlink.dto.MentorDtos;
import com.mentorlink.mentorlink.exception.BadRequestException;
import com.mentorlink.mentorlink.exception.NotFoundException;
import com.mentorlink.mentorlink.repository.MentorProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MentorService {

    private final MentorProfileRepository mentorProfileRepository;
    private final UserService userService;

    @Transactional
    public MentorDtos.MentorResponse createMentorProfile(MentorDtos.CreateMentorProfileRequest request) {
        User user = userService.findById(request.userId());

        if (user.getRole() != Role.MENTOR) {
            throw new BadRequestException("멘토 역할 사용자만 프로필을 생성할 수 있습니다.");
        }

        mentorProfileRepository.findByUserUserId(request.userId()).ifPresent(profile -> {
            throw new BadRequestException("이미 멘토 프로필이 존재합니다.");
        });

        MentorProfile profile = mentorProfileRepository.save(MentorProfile.builder()
                .user(user)
                .bio(request.bio())
                .field(request.field())
                .careerYear(request.careerYear())
                .build());

        return toResponse(profile);
    }

    @Transactional(readOnly = true)
    public List<MentorDtos.MentorResponse> getMentors() {
        return mentorProfileRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public MentorProfile findById(Long mentorId) {
        return mentorProfileRepository.findById(mentorId)
                .orElseThrow(() -> new NotFoundException("멘토를 찾을 수 없습니다."));
    }

    private MentorDtos.MentorResponse toResponse(MentorProfile mentorProfile) {
        return new MentorDtos.MentorResponse(
                mentorProfile.getMentorId(),
                mentorProfile.getUser().getUserId(),
                mentorProfile.getUser().getName(),
                mentorProfile.getField(),
                mentorProfile.getCareerYear(),
                mentorProfile.getBio()
        );
    }
}
