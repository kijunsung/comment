package com.example.tour_backend.dto.traffic;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@NoArgsConstructor
@Getter
@Setter
public class TrafficDto {
    private Long trafficId;
    private Long tourId;
    private String vehicle;
    private LocalDateTime spendTime;
    private int price;

    @Builder
    public TrafficDto(Long trafficId,Long tourId,String vehicle,LocalDateTime spendTime,int price){
        this.trafficId =trafficId;
        this.tourId=tourId;
        this.vehicle=vehicle;
        this.spendTime=spendTime;
        this.price=price;
    }
}
