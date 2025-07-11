package com.example.tour_backend.domain.thread;

import com.example.tour_backend.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ThreadLikeRepository extends JpaRepository<ThreadLike, Long> {
    Optional<ThreadLike> findByUserAndThread(User user, Thread thread);
    boolean existsByUserAndThread(User user, Thread thread);

    void deleteByUserAndThread(User user, Thread thread);
}

//좋아요 여부 체크 및 취소할 수 있도록 쿼리 메서드 제공