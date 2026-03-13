package com.mentorlink.domain.mentor.service;

import com.mentorlink.domain.mentor.dto.CreateMentorProfileRequest;
import com.mentorlink.domain.mentor.dto.MentorResponse;
import com.mentorlink.domain.mentor.entity.MentorProfile;
import com.mentorlink.domain.mentor.repository.MentorProfileRepository;
import com.mentorlink.domain.user.entity.User;
import com.mentorlink.domain.user.entity.UserRole;
import com.mentorlink.domain.user.repository.UserRepository;
import com.mentorlink.global.exception.CustomException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MentorService {

    private final MentorProfileRepository mentorProfileRepository;
    private final UserRepository userRepository;

    @Transactional
    public MentorResponse createProfile(Long userId, CreateMentorProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "존재하지 않는 사용자입니다."));

        if (user.getRole() != UserRole.MENTOR) {
            throw new CustomException(HttpStatus.FORBIDDEN, "멘토만 프로필을 등록할 수 있습니다.");
        }

        mentorProfileRepository.findByUserId(userId)
                .ifPresent(profile -> {
                    throw new CustomException(HttpStatus.CONFLICT, "이미 멘토 프로필이 존재합니다.");
                });

        MentorProfile profile = mentorProfileRepository.save(MentorProfile.builder()
                .user(user)
                .field(request.getField())
                .bio(request.getBio())
                .careerYear(request.getCareerYear())
                .build());

        return toResponse(profile);
    }

    public List<MentorResponse> getMentorList() {
        return mentorProfileRepository.findAll().stream().map(this::toResponse).toList();
    }

    public MentorResponse getMentorDetail(Long mentorId) {
        MentorProfile profile = mentorProfileRepository.findByUserId(mentorId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "존재하지 않는 멘토입니다."));
        return toResponse(profile);
    }

    private MentorResponse toResponse(MentorProfile profile) {
        return MentorResponse.builder()
                .mentorId(profile.getUser().getId())
                .mentorName(profile.getUser().getName())
                .field(profile.getField())
                .bio(profile.getBio())
                .careerYear(profile.getCareerYear())
                .build();
    }
}
