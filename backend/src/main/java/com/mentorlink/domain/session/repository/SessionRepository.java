package com.mentorlink.domain.session.repository;

import com.mentorlink.domain.session.entity.Session;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface SessionRepository extends JpaRepository<Session, Long> {

    @Query("select s from Session s join fetch s.application a join fetch a.mentor join fetch a.mentee where a.mentor.id = :userId or a.mentee.id = :userId order by s.id desc")
    List<Session> findByUserId(Long userId);

    @Query("select s from Session s join fetch s.application a join fetch a.mentor join fetch a.mentee where s.id = :id")
    Optional<Session> findWithApplicationById(Long id);
}
