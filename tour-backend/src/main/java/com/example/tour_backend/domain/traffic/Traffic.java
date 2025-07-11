package com.example.tour_backend.domain.traffic;

import com.example.tour_backend.domain.tour.Tour;
import jakarta.persistence.*;
import lombok.*;


import java.time.LocalDateTime;

@Entity
@Table(name = "traffic")
@NoArgsConstructor
@Getter
@Setter
public class Traffic {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long trafficId;

    @ManyToOne
    @JoinColumn(name = "tourId", nullable = false)
    private Tour tour;

    @Column(nullable = false, length = 225)
    private String vehicle;

    @Column(nullable = false)
    private LocalDateTime spendTime;

    @Column(nullable = false)
    private int price;

    @Builder
    public Traffic(Tour tour, String vehicle, LocalDateTime spendTime, int price) {
        this.tour = tour;
        this.vehicle = vehicle;
        this.spendTime = spendTime;
        this.price = price;
    }

}
