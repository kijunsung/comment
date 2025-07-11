package com.example.tour_backend.domain.tour;

import com.example.tour_backend.domain.user.User;
import jakarta.persistence.*;
import lombok.*;
import java.sql.Date;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "tour")
@NoArgsConstructor
@Getter
@Setter
public class Tour {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long tourId;

    @ManyToOne
    @JoinColumn(name = "userId", nullable = false)
    private User user;

    @Column(nullable = false, length = 225)
    private String title;

    @Column(nullable = false)
    private Date startDate;

    @Column(nullable = false)
    private Date endDate;

    @CreationTimestamp
    private LocalDateTime createDate;

    @UpdateTimestamp
    private LocalDateTime modifiedDate;

//    @OneToMany(mappedBy = "tour")
//    private List<Schedule> schedules;
//
//    @OneToMany(mappedBy = "tour")
//    private List<Traffic> traffics;
//
//    @OneToMany(mappedBy = "tour")
//    private List<Weather> weathers;

    @Builder
    public Tour(User user, String title, Date startDate, Date endDate,
                LocalDateTime createDate, LocalDateTime modifiedDate /*List<Schedule> schedules,
                List<Traffic> traffics, List<Weather> weathers*/) {
        this.user = user;
        this.title = title;
        this.startDate = startDate;
        this.endDate = endDate;
        this.createDate = createDate;
        this.modifiedDate = modifiedDate;
//        this.schedules = schedules;
//        this.traffics = traffics;
//        this.weathers = weathers;
    }
}
