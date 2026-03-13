package com.mentorlink.mentorlink.service;

import com.mentorlink.mentorlink.domain.Review;
import com.mentorlink.mentorlink.domain.SessionStatus;
import com.mentorlink.mentorlink.domain.User;
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
    public ReviewDtos.ReviewResponse createReview(User currentUser, ReviewDtos.CreateReviewRequest request) {
        var session = sessionService.findById(request.sessionId());

        if (!session.getApplication().getMentee().getUserId().equals(currentUser.getUserId())) {
            throw new BadRequestException("해당 세션을 신청한 멘티만 후기를 작성할 수 있습니다.");
        }

        if (session.getStatus() != SessionStatus.FINISHED) {
            throw new BadRequestException("종료된 세션만 후기를 작성할 수 있습니다.");
        }

        if (reviewRepository.existsBySessionSessionId(session.getSessionId())) {
            throw new BadRequestException("이미 후기가 등록된 세션입니다.");
        }

        Review review = reviewRepository.save(Review.builder()
                .session(session)
                .rating(request.rating())
                .comment(request.comment())
                .build());

        return new ReviewDtos.ReviewResponse(
                review.getReviewId(),
                session.getSessionId(),
                session.getApplication().getMentor().getMentorId(),
                currentUser.getName(),
                review.getRating(),
                review.getComment(),
                review.getCreatedAt()
        );
    }
}
