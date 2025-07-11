package com.example.tour_backend.domain.mapentity;

import com.example.tour_backend.domain.schedule.Schedule;
import com.example.tour_backend.domain.tour.Tour;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "mapentity")
@NoArgsConstructor
@Getter
@Setter
public class MapEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long mapId;

    @ManyToOne
    @JoinColumn(name = "scheduleId", nullable = false)
    private Schedule schedule;

    @ManyToOne
    @JoinColumn(name = "tourId", nullable = false)
    private Tour tour;

    @Column(nullable = false, length = 225)
    private String location;

    @Column(nullable = false)
    private LocalDateTime createDate;

    @Builder
    public MapEntity(Schedule schedule, Tour tour, String location, LocalDateTime createDate) {
        this.schedule = schedule;
        this.tour = tour;
        this.location = location;
        this.createDate = createDate;
    }
}


