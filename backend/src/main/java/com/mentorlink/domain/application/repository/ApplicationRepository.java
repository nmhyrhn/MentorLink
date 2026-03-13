package com.mentorlink.domain.application.repository;

import com.mentorlink.domain.application.entity.Application;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

    @Query("select a from Application a join fetch a.mentor join fetch a.mentee where a.mentee.id = :menteeId order by a.id desc")
    List<Application> findSentByMenteeId(Long menteeId);

    @Query("select a from Application a join fetch a.mentor join fetch a.mentee where a.mentor.id = :mentorId order by a.id desc")
    List<Application> findReceivedByMentorId(Long mentorId);

    @Query("select a from Application a join fetch a.mentor join fetch a.mentee where a.id = :id")
    Optional<Application> findWithUsersById(Long id);
}
