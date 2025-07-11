package com.example.tour_backend.dto.tour;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.sql.Date;
import java.time.LocalDateTime;

@NoArgsConstructor
@Getter
@Setter
public class TourDto {
    private Long tourId;
    private Long userId;
    private String title;
    private Date startDate;
    private Date endDate;
    private LocalDateTime createDate;
    private LocalDateTime modifiedDate;

    @Builder
    public TourDto (Long tourId, Long userId,String title, Date startDate, Date endDate,LocalDateTime createDate, LocalDateTime modifiedDate){
        this.tourId = tourId;
        this.userId =userId;
        this.title=title;
        this.startDate = startDate;
        this.endDate=endDate;
        this.createDate=createDate;
        this.modifiedDate=modifiedDate;

    }
}
