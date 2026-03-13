package com.mentorlink.mentorlink.service;

import com.mentorlink.mentorlink.domain.Review;
import com.mentorlink.mentorlink.domain.SessionStatus;
import com.mentorlink.mentorlink.dto.ReviewDtos;
import com.mentorlink.mentorlink.exception.BadRequestException;
import com.mentorlink.mentorlink.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final SessionService sessionService;

    @Transactional
    public ReviewDtos.ReviewResponse createReview(ReviewDtos.CreateReviewRequest request) {
        var session = sessionService.findById(request.sessionId());

        if (session.getStatus() != SessionStatus.FINISHED) {
            throw new BadRequestException("종료된 세션(FINISHED)에만 리뷰를 작성할 수 있습니다.");
        }

        Review review = reviewRepository.save(Review.builder()
                .session(session)
                .rating(request.rating())
                .comment(request.comment())
                .build());

        return new ReviewDtos.ReviewResponse(review.getReviewId(), session.getSessionId(), review.getRating(), review.getComment());
    }
}
