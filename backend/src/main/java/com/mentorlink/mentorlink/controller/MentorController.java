package com.mentorlink.mentorlink.controller;

import com.mentorlink.mentorlink.dto.MentorDtos;
import com.mentorlink.mentorlink.service.MentorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/mentors")
@RequiredArgsConstructor
public class MentorController {

    private final MentorService mentorService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MentorDtos.MentorResponse createMentor(@RequestBody @Valid MentorDtos.CreateMentorProfileRequest request) {
        return mentorService.createMentorProfile(request);
    }

    @GetMapping
    public List<MentorDtos.MentorResponse> getMentors() {
        return mentorService.getMentors();
    }
}
