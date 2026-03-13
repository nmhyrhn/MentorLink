package com.mentorlink.mentorlink.service;

import com.mentorlink.mentorlink.domain.User;
import com.mentorlink.mentorlink.dto.UserDtos;
import com.mentorlink.mentorlink.exception.BadRequestException;
import com.mentorlink.mentorlink.exception.NotFoundException;
import com.mentorlink.mentorlink.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional
    public UserDtos.UserResponse signUp(UserDtos.SignUpRequest request) {
        userRepository.findByEmail(request.email()).ifPresent(user -> {
            throw new BadRequestException("이미 사용 중인 이메일입니다.");
        });

        User user = userRepository.save(User.builder()
                .name(request.name())
                .email(request.email())
                .password(request.password())
                .role(request.role())
                .build());

        return toResponse(user);
    }

    @Transactional(readOnly = true)
    public UserDtos.UserResponse login(UserDtos.LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));

        if (!user.getPassword().equals(request.password())) {
            throw new BadRequestException("비밀번호가 일치하지 않습니다.");
        }

        return toResponse(user);
    }

    public User findById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));
    }

    private UserDtos.UserResponse toResponse(User user) {
        return new UserDtos.UserResponse(user.getUserId(), user.getName(), user.getEmail(), user.getRole());
    }
}
