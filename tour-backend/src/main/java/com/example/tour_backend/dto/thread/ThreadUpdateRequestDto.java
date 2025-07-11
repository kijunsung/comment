package com.example.tour_backend.dto.thread;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ThreadUpdateRequestDto {
    private String title;
    private String content;
    private String author;
    private String pdfPath;
    private String area;
    private Long userId;
}
// 추추가 클래스 자체를 새로 만듬