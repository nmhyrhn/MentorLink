package com.mentorlink.mentorlink.service;

import com.mentorlink.mentorlink.domain.ApplicationStatus;
import com.mentorlink.mentorlink.domain.MentorProfile;
import com.mentorlink.mentorlink.domain.Review;
import com.mentorlink.mentorlink.domain.Role;
import com.mentorlink.mentorlink.domain.User;
import com.mentorlink.mentorlink.dto.MentorDtos;
import com.mentorlink.mentorlink.exception.BadRequestException;
import com.mentorlink.mentorlink.exception.NotFoundException;
import com.mentorlink.mentorlink.repository.ApplicationRepository;
import com.mentorlink.mentorlink.repository.MentorProfileRepository;
import com.mentorlink.mentorlink.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class MentorService {

    private static final String DEFAULT_IMAGE_URL = "/default-mentor.svg";
    private static final List<Integer> ALLOWED_DURATIONS = List.of(30, 60, 90, 120, 150, 180, 210, 240);
    private static final List<ApplicationStatus> BLOCKING_STATUSES = List.of(
            ApplicationStatus.PENDING,
            ApplicationStatus.APPROVED,
            ApplicationStatus.COMPLETED
    );

    private final MentorProfileRepository mentorProfileRepository;
    private final ReviewRepository reviewRepository;
    private final ApplicationRepository applicationRepository;
    private final UserService userService;

    @Transactional
    public MentorDtos.MentorResponse upsertMentorProfile(Long currentUserId, MentorDtos.UpsertMentorProfileRequest request) {
        User user = userService.findById(currentUserId);

        if (user.getRole() != Role.MENTOR) {
            throw new BadRequestException("멘토 권한 사용자만 프로필을 관리할 수 있습니다.");
        }

        MentorProfile profile = mentorProfileRepository.findByUserUserId(currentUserId)
                .orElseGet(() -> MentorProfile.builder()
                        .user(user)
                        .imageUrl(DEFAULT_IMAGE_URL)
                        .build());

        validateAvailabilityRules(request.availabilityRules());

        profile.setBio(request.bio());
        profile.setField(request.field());
        profile.setCareerYear(request.careerYear());
        profile.setImageUrl(DEFAULT_IMAGE_URL);
        profile.setExpertiseCsv(joinStrings(request.expertise()));
        profile.setAvailabilityRulesCsv(joinAvailabilityRules(request.availabilityRules()));

        return toResponse(mentorProfileRepository.save(profile));
    }

    @Transactional(readOnly = true)
    public List<MentorDtos.MentorResponse> getMentors() {
        return mentorProfileRepository.findAll().stream()
                .sorted(Comparator.comparing(profile -> profile.getUser().getName()))
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public MentorDtos.MentorResponse getMentor(Long mentorId) {
        return toResponse(findById(mentorId));
    }

    @Transactional(readOnly = true)
    public MentorDtos.MentorResponse getMyMentorProfile(Long currentUserId) {
        MentorProfile profile = mentorProfileRepository.findByUserUserId(currentUserId)
                .orElseThrow(() -> new NotFoundException("멘토 프로필을 찾을 수 없습니다."));
        return toResponse(profile);
    }

    @Transactional(readOnly = true)
    public MentorProfile findById(Long mentorId) {
        return mentorProfileRepository.findById(mentorId)
                .orElseThrow(() -> new NotFoundException("멘토를 찾을 수 없습니다."));
    }

    @Transactional(readOnly = true)
    public List<MentorDtos.AvailableSlotResponse> getAvailableSlots(Long mentorId) {
        return getAvailableSlots(mentorId, null);
    }

    @Transactional(readOnly = true)
    public List<MentorDtos.AvailableSlotResponse> getAvailableSlots(Long mentorId, Long ignoredApplicationId) {
        MentorProfile profile = findById(mentorId);
        List<AvailabilityRule> rules = parseAvailabilityRules(profile.getAvailabilityRulesCsv());
        List<BlockedInterval> blockedIntervals = getBlockedIntervals(profile.getMentorId(), ignoredApplicationId);
        LocalDateTime now = LocalDateTime.now().withSecond(0).withNano(0);
        List<MentorDtos.AvailableSlotResponse> slots = new ArrayList<>();

        for (int offset = 0; offset < 30; offset++) {
            LocalDate date = LocalDate.now().plusDays(offset);
            rules.stream()
                    .filter(rule -> rule.dayOfWeek() == date.getDayOfWeek())
                    .forEach(rule -> slots.addAll(buildSlotsForDate(date, rule, blockedIntervals, now)));
        }

        return slots;
    }

    @Transactional(readOnly = true)
    public void validateReservation(Long mentorId, LocalDateTime startAt, int durationMinutes) {
        validateReservation(mentorId, startAt, durationMinutes, null);
    }

    @Transactional(readOnly = true)
    public void validateReservation(Long mentorId, LocalDateTime startAt, int durationMinutes, Long ignoredApplicationId) {
        if (startAt.getMinute() != 0 && startAt.getMinute() != 30) {
            throw new BadRequestException("예약 시작 시간은 정각 또는 30분 단위로만 선택할 수 있습니다.");
        }

        if (durationMinutes <= 0 || durationMinutes % 30 != 0) {
            throw new BadRequestException("상담 시간은 30분 단위로만 선택할 수 있습니다.");
        }

        MentorDtos.AvailableSlotResponse slot = getAvailableSlots(mentorId, ignoredApplicationId).stream()
                .filter(availableSlot -> availableSlot.startAt().equals(startAt))
                .findFirst()
                .orElseThrow(() -> new BadRequestException("선택한 예약 시간은 현재 예약할 수 없습니다."));

        if (!slot.durationOptions().contains(durationMinutes)) {
            throw new BadRequestException("선택한 상담 시간은 멘토의 가능 시간 또는 기존 예약과 겹칩니다.");
        }
    }

    private List<MentorDtos.AvailableSlotResponse> buildSlotsForDate(
            LocalDate date,
            AvailabilityRule rule,
            List<BlockedInterval> blockedIntervals,
            LocalDateTime now
    ) {
        List<MentorDtos.AvailableSlotResponse> slots = new ArrayList<>();
        LocalDateTime cursor = date.atTime(rule.startTime());
        LocalDateTime dayEnd = date.atTime(rule.endTime());

        while (cursor.isBefore(dayEnd)) {
            if (!cursor.isAfter(now)) {
                cursor = cursor.plusMinutes(30);
                continue;
            }

            LocalDateTime slotStart = cursor;
            List<Integer> durationOptions = ALLOWED_DURATIONS.stream()
                    .filter(duration -> canBook(slotStart, slotStart.plusMinutes(duration), dayEnd, blockedIntervals))
                    .toList();

            if (!durationOptions.isEmpty()) {
                int maxDuration = durationOptions.get(durationOptions.size() - 1);
                slots.add(new MentorDtos.AvailableSlotResponse(
                        slotStart,
                        slotStart.plusMinutes(maxDuration),
                        maxDuration,
                        durationOptions
                ));
            }

            cursor = cursor.plusMinutes(30);
        }

        return slots;
    }

    private boolean canBook(LocalDateTime startAt, LocalDateTime endAt, LocalDateTime dayEnd, Collection<BlockedInterval> blockedIntervals) {
        if (endAt.isAfter(dayEnd)) {
            return false;
        }

        return blockedIntervals.stream().noneMatch(interval -> overlaps(startAt, endAt, interval.startAt(), interval.endAt()));
    }

    private boolean overlaps(LocalDateTime leftStart, LocalDateTime leftEnd, LocalDateTime rightStart, LocalDateTime rightEnd) {
        return leftStart.isBefore(rightEnd) && rightStart.isBefore(leftEnd);
    }

    private List<BlockedInterval> getBlockedIntervals(Long mentorId, Long ignoredApplicationId) {
        return applicationRepository.findByMentorMentorIdAndStatusIn(mentorId, BLOCKING_STATUSES).stream()
                .filter(application -> ignoredApplicationId == null || !application.getApplicationId().equals(ignoredApplicationId))
                .map(application -> new BlockedInterval(application.getPreferredAt(), application.getPreferredEndAt()))
                .filter(interval -> interval.endAt().isAfter(LocalDateTime.now()))
                .toList();
    }

    private MentorDtos.MentorResponse toResponse(MentorProfile mentorProfile) {
        List<Review> reviews = reviewRepository.findBySessionApplicationMentorMentorIdOrderByCreatedAtDesc(mentorProfile.getMentorId());
        List<MentorDtos.MentorReviewResponse> reviewResponses = reviews.stream()
                .map(review -> new MentorDtos.MentorReviewResponse(
                        review.getReviewId(),
                        review.getSession().getSessionId(),
                        review.getSession().getApplication().getMentee().getName(),
                        review.getRating(),
                        review.getComment(),
                        review.getCreatedAt()
                ))
                .toList();

        double average = reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);

        return new MentorDtos.MentorResponse(
                mentorProfile.getMentorId(),
                mentorProfile.getUser().getUserId(),
                mentorProfile.getUser().getName(),
                mentorProfile.getField(),
                mentorProfile.getCareerYear(),
                mentorProfile.getBio(),
                mentorProfile.getImageUrl() == null || mentorProfile.getImageUrl().isBlank() ? DEFAULT_IMAGE_URL : mentorProfile.getImageUrl(),
                parseStrings(mentorProfile.getExpertiseCsv()),
                parseAvailabilityRules(mentorProfile.getAvailabilityRulesCsv()).stream()
                        .map(rule -> new MentorDtos.AvailabilityRuleResponse(
                                rule.dayOfWeek(),
                                rule.dayOfWeek().getDisplayName(TextStyle.SHORT, Locale.KOREAN),
                                rule.startTime(),
                                rule.endTime()
                        ))
                        .toList(),
                reviews.isEmpty() ? null : average,
                reviews.size(),
                reviewResponses
        );
    }

    private void validateAvailabilityRules(List<MentorDtos.AvailabilityRuleRequest> rules) {
        for (MentorDtos.AvailabilityRuleRequest rule : rules) {
            LocalTime startTime = LocalTime.parse(rule.startTime());
            LocalTime endTime = LocalTime.parse(rule.endTime());

            if (!startTime.isBefore(endTime)) {
                throw new BadRequestException("예약 가능 시간의 시작은 종료보다 빨라야 합니다.");
            }

            long minutes = Duration.between(startTime, endTime).toMinutes();
            if (minutes < 30) {
                throw new BadRequestException("예약 가능 시간은 최소 30분 이상이어야 합니다.");
            }
        }
    }

    private String joinStrings(List<String> values) {
        return values == null ? "" : values.stream()
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .distinct()
                .reduce((left, right) -> left + "," + right)
                .orElse("");
    }

    private String joinAvailabilityRules(List<MentorDtos.AvailabilityRuleRequest> rules) {
        return rules == null ? "" : rules.stream()
                .map(rule -> rule.dayOfWeek() + "|" + rule.startTime() + "|" + rule.endTime())
                .distinct()
                .reduce((left, right) -> left + ";" + right)
                .orElse("");
    }

    private List<String> parseStrings(String csv) {
        if (csv == null || csv.isBlank()) {
            return Collections.emptyList();
        }

        return Arrays.stream(csv.split(","))
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .toList();
    }

    private List<AvailabilityRule> parseAvailabilityRules(String rulesCsv) {
        if (rulesCsv == null || rulesCsv.isBlank()) {
            return Collections.emptyList();
        }

        return Arrays.stream(rulesCsv.split(";"))
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .map(rule -> {
                    String[] parts = rule.split("\\|");
                    return new AvailabilityRule(
                            DayOfWeek.valueOf(parts[0]),
                            LocalTime.parse(parts[1]),
                            LocalTime.parse(parts[2])
                    );
                })
                .sorted(Comparator.comparing(AvailabilityRule::dayOfWeek).thenComparing(AvailabilityRule::startTime))
                .toList();
    }

    private record AvailabilityRule(DayOfWeek dayOfWeek, LocalTime startTime, LocalTime endTime) {
    }

    private record BlockedInterval(LocalDateTime startAt, LocalDateTime endAt) {
    }
}
