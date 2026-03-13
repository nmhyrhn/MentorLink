package com.mentorlink.mentorlink.controller;

import com.mentorlink.mentorlink.dto.MentorDtos;
import com.mentorlink.mentorlink.security.CustomUserDetails;
import com.mentorlink.mentorlink.service.MentorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/mentors")
@RequiredArgsConstructor
public class MentorController {

    private final MentorService mentorService;

    @PostMapping("/profile")
    @ResponseStatus(HttpStatus.CREATED)
    public MentorDtos.MentorResponse createMentor(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody @Valid MentorDtos.UpsertMentorProfileRequest request
    ) {
        return mentorService.upsertMentorProfile(userDetails.userId(), request);
    }

    @PutMapping("/me/profile")
    public MentorDtos.MentorResponse updateMyMentorProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody @Valid MentorDtos.UpsertMentorProfileRequest request
    ) {
        return mentorService.upsertMentorProfile(userDetails.userId(), request);
    }

    @GetMapping
    public List<MentorDtos.MentorResponse> getMentors() {
        return mentorService.getMentors();
    }

    @GetMapping("/{id}")
    public MentorDtos.MentorResponse getMentor(@PathVariable Long id) {
        return mentorService.getMentor(id);
    }

    @GetMapping("/{id}/available-slots")
    public List<MentorDtos.AvailableSlotResponse> getAvailableSlots(@PathVariable Long id) {
        return mentorService.getAvailableSlots(id);
    }

    @GetMapping("/me/profile")
    public MentorDtos.MentorResponse getMyMentorProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return mentorService.getMyMentorProfile(userDetails.userId());
    }
}
