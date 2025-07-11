package com.example.tour_backend.dto.weather;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.sql.Timestamp;

@NoArgsConstructor
@Getter
@Setter
public class WeatherDto {
    private Long weatherId;
    private Long tourId;
    private double temperature;
    private String description;
    private Timestamp createDate;
    private Timestamp modifiedDate;

    @Builder
    public WeatherDto(Long weatherId,Long tourId,double temperature, String description,Timestamp createDate,Timestamp modifiedDate){
        this.weatherId = weatherId;
        this.tourId = tourId;
        this.temperature=temperature;
        this.description=description;
        this.createDate=createDate;
        this.modifiedDate=modifiedDate;
    }
}
