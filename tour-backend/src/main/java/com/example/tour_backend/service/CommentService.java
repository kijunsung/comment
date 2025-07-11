package com.example.tour_backend.service;

import com.example.tour_backend.domain.comment.Comment;
import com.example.tour_backend.domain.comment.CommentRepository;
import com.example.tour_backend.domain.thread.Thread;
import com.example.tour_backend.domain.thread.ThreadRepository;
import com.example.tour_backend.dto.comment.CommentDto;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository; // 댓글 데이터베이스 접근용 리포지토리
    private final ThreadRepository threadRepository; // 게시글 데이터베이스 접근용 리포지토리
    private final NotificationService notificationService; //7/3

    @Transactional
    public CommentDto addComment(CommentDto dto) {
        // 1. 댓글이 달릴 게시글 존재 여부 확인
        Thread thread = threadRepository.findById(dto.getThreadId())
                .orElseThrow(() -> new RuntimeException("게시물이 존재하지 않습니다."));

        // 2. Comment 엔티티 생성 (댓글 내용, 작성자, 게시글 연관관계 설정)
        Comment comment = Comment.builder()
                .thread(thread)
                .comment(dto.getComment())
                .author(dto.getAuthor())
                .build();
        // 부모 댓글이 있을 경우 설정 (대댓글 등록 시) 7/2
        if (dto.getParentId() != null) {
            Comment parent = commentRepository.findById(dto.getParentId())
                    .orElseThrow(() -> new RuntimeException("부모 댓글이 존재하지 않습니다."));
            comment.setParent(parent);
        }
        // 3. 댓글 저장
        commentRepository.save(comment);
        //  알림 생성 추가 7/3
        notificationService.createNotification(
                thread.getUser().getUserId(),           // 게시글 작성자
                thread.getThreadId(),                   // 게시글 ID
                comment.getCommentId(),                 // 댓글 ID
                comment.getAuthor() + "님이 댓글을 남겼습니다."
        );
        // 4. 저장 후 DB에서 생성된 댓글ID, 생성일, 수정일을 DTO에 세팅해 반환
        dto.setCommentId(comment.getCommentId());
        dto.setCreateDate(comment.getCreateDate());
        dto.setModifiedDate(comment.getModifiedDate());

        return dto;
    }

    @Transactional(readOnly = true) // 댓글 목록 조회 (대댓글 포함)7/2
    public List<CommentDto> getComments(Long threadId) {
        // 부모 댓글만 가져오고, 자식은 DTO 내부에서 트리 구조로 처리
        List<Comment> parents = commentRepository.findByThread_ThreadIdAndParentIsNull(threadId);
        return parents.stream().map(this::convertToDtoWithChildren).collect(Collectors.toList());
    }
    private CommentDto convertToDtoWithChildren(Comment comment) {
        CommentDto dto = new CommentDto();
        dto.setCommentId(comment.getCommentId());
        dto.setThreadId(comment.getThread().getThreadId());
        dto.setAuthor(comment.getAuthor());
        dto.setComment(comment.getComment());
        dto.setCreateDate(comment.getCreateDate());
        dto.setModifiedDate(comment.getModifiedDate());
        dto.setParentId(comment.getParent() != null ? comment.getParent().getCommentId() : null);

        // 대댓글 재귀적으로 처리
        List<CommentDto> children = comment.getChildren().stream()
                .map(this::convertToDtoWithChildren)
                .collect(Collectors.toList());

        dto.setComments(children);
        return dto;
    }

//        // 게시글 ID로 모든 댓글 조회 후 Comment -> CommentDto 변환
//        return commentRepository.findByThread_ThreadId(threadId)
//            .stream()
//                .map(comment -> {
//        CommentDto dto = new CommentDto();
//        dto.setCommentId(comment.getCommentId());
//        dto.setThreadId(comment.getThread().getThreadId());
//        dto.setAuthor(comment.getAuthor());
//        dto.setComment(comment.getComment());
//        dto.setCreateDate(comment.getCreateDate());
//        dto.setModifiedDate(comment.getModifiedDate());
//        return dto;
//    })
//            .collect(Collectors.toList());


    // 댓글 수정 6/30
    @Transactional
    public CommentDto updateComment(Long commentId, CommentDto dto) {
        // 1. 댓글 존재 여부 확인 후 조회
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("댓글이 존재하지 않습니다."));

//        // 현재 로그인된 사용자 가져오기
//        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
//        //  작성자 본인인지 확인
//        if (!comment.getAuthor().equals(currentUsername)) {
//            throw new AccessDeniedException("본인만 수정할 수 있습니다.");
//        }

        // 2. 댓글 내용 수정
        comment.setComment(dto.getComment());
        // 3. 저장 후 업데이트된 엔티티를 반환받아 DTO에 생성일, 수정일 세팅
        Comment updated = commentRepository.save(comment);

        dto.setCreateDate(updated.getCreateDate());
        dto.setModifiedDate(updated.getModifiedDate());

        return dto;
    }
    // 댓글 삭제 6/30
    @Transactional
    public void deleteComment(Long commentId) {
        // 1. 댓글 존재 여부 확인 후 조회
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("댓글이 존재하지 않습니다."));
//        // 현재 로그인된 사용자 가져오기
//        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
//
//        //  작성자 본인인지 확인
//        if (!comment.getAuthor().equals(currentUsername)) {
//            throw new AccessDeniedException("본인만 삭제할 수 있습니다.");
//        } // 현재 보안을 프론트에서 로그인한 사용자만 접근하게 했기때문에 백엔드에서 따로 확인안함. 하지만 보안성을 높이고 싶다면 백엔드에서 해줘야함

        // 2. 댓글 삭제
        commentRepository.delete(comment);
    }


}
