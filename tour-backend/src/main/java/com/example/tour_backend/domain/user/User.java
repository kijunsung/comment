package com.example.tour_backend.domain.user;

import com.example.tour_backend.domain.Role;
import com.example.tour_backend.domain.comment.Comment;
import com.example.tour_backend.domain.thread.ThreadLike;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import com.example.tour_backend.domain.thread.Thread;

@Entity  //없으면 JPA가 이 클래스를 테이블로 인식하지 않아서 DB와 연동 안 됨
@Table(name = "users")  //테이블 이름을 직접 지정 (기본은 클래스 이름 소문자)
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder //.builder() 방식으로 객체 생성 가능 (유연한 생성 패턴)

public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @Column(nullable = false, unique = true)
    private String username;

    private String password;
    private String name;
    private String email;
    private String phone;
    private String nickname;

    @Enumerated(EnumType.STRING)
    private Role role;

    @CreationTimestamp
    private LocalDateTime createDate;

    @UpdateTimestamp
    private LocalDateTime modifiedDate;


    // 관리자가 cascade활용하여 게시글 있는 유저 삭제
    // 📝 유저가 작성한 게시글들
    @OneToMany(mappedBy = "user", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<Thread> threads = new ArrayList<>();

    // 📝 유저가 작성한 댓글들
    @OneToMany(mappedBy = "user", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<Comment> comments = new ArrayList<>();

    // ❤️ 유저가 누른 좋아요들
    @OneToMany(mappedBy = "user", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<ThreadLike> likes = new ArrayList<>();


    @Builder
    public User(String password, String name, String email, String phone, String nickname,
                LocalDateTime createDate, LocalDateTime modifiedDate, Role role /*List<Tour> tours, List<Thread> threads*/) {
        this.password = password;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.nickname = nickname;
        this.createDate = createDate;
        this.modifiedDate = modifiedDate;
        this.role = role != null ? role : Role.USER; // 기본값 USER
//        this.tours = tours;
//        this.threads = threads;
    }
}