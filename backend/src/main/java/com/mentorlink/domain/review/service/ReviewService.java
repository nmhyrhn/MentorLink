package com.mentorlink.domain.review.service;

import com.mentorlink.domain.review.dto.CreateReviewRequest;
import com.mentorlink.domain.review.dto.ReviewResponse;
import com.mentorlink.domain.review.entity.Review;
import com.mentorlink.domain.review.repository.ReviewRepository;
import com.mentorlink.domain.session.entity.Session;
import com.mentorlink.domain.session.entity.SessionStatus;
import com.mentorlink.domain.session.service.SessionService;
import com.mentorlink.global.exception.CustomException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final SessionService sessionService;

    @Transactional
    public ReviewResponse create(Long userId, CreateReviewRequest request) {
        Session session = sessionService.getSessionWithApplication(request.getSessionId());

        if (!session.getApplication().getMentee().getId().equals(userId)) {
            throw new CustomException(HttpStatus.FORBIDDEN, "해당 세션의 멘티만 리뷰를 작성할 수 있습니다.");
        }
        if (session.getStatus() != SessionStatus.FINISHED) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "종료되지 않은 세션에는 리뷰를 작성할 수 없습니다.");
        }
        if (reviewRepository.existsBySessionId(session.getId())) {
            throw new CustomException(HttpStatus.CONFLICT, "이미 리뷰가 작성된 세션입니다.");
        }

        Review saved = reviewRepository.save(Review.builder()
                .session(session)
                .rating(request.getRating())
                .comment(request.getComment())
                .build());

        return ReviewResponse.builder()
                .reviewId(saved.getId())
                .sessionId(session.getId())
                .rating(saved.getRating())
                .comment(saved.getComment())
                .createdAt(saved.getCreatedAt())
                .build();
    }
}
