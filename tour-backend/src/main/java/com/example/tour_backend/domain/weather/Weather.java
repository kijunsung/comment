package com.example.tour_backend.domain.weather;

import com.example.tour_backend.domain.tour.Tour;
import jakarta.persistence.*;
import lombok.*;
import java.sql.Timestamp;

@Entity
@Table(name = "weather")
@NoArgsConstructor
@Getter
@Setter
public class Weather {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long weatherId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tour_id", nullable = false)
    private Tour tour;

    @Column(nullable = false)
    private double temperature;

    @Column(nullable = false, length = 225)
    private String description;

    @Column(nullable = false)
    private Timestamp createDate;

    @Column(nullable = false)
    private Timestamp modifiedDate;

    @Builder
    public Weather(
                   Tour tour,
                   double temperature,
                   String description,
                   Timestamp createDate,
                   Timestamp modifiedDate) {
        this.tour         = tour;
        this.temperature  = temperature;
        this.description  = description;
        this.createDate   = createDate;
        this.modifiedDate = modifiedDate;
    }
}
