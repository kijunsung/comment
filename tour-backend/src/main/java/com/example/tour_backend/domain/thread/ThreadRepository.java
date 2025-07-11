package com.example.tour_backend.domain.thread;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Sort;

import java.util.List;

public interface ThreadRepository extends JpaRepository<Thread, Long> {
    // 게시물 검색 기능 추추추추가
    // 제목이나 내용에 키워드가 포함된 게시글 검색
    @Query("SELECT t FROM Thread t WHERE t.title LIKE %:keyword% OR t.content LIKE %:keyword%")
    List<Thread> searchByTitleOrContent(@Param("keyword") String keyword);

    // 또는 간단히 메서드 이름으로도 가능
    List<Thread> findByTitleContainingOrContentContaining(String titleKeyword, String contentKeyword, Sort sort);
    List<Thread> findByAuthorContaining(String author, Sort sort); //(수정함)
}