package com.example.tour_backend.dto.thread;

import com.example.tour_backend.dto.comment.CommentDto;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ThreadDto {
    private Long threadId;
    private Long userId;
    private String title;
    private String content;
    private String author;
    private int count;
    private int heart;
    private String pdfPath;
    private int commentCount;
    private String area;

    private LocalDateTime createDate;
    private LocalDateTime modifiedDate;

    // 프론트에서 버튼 상태 유지에 사용할 필드 7/1
    private boolean likedByCurrentUser;
    // 댓글 리스트 추가 7/2
    private List<CommentDto> comments;
}