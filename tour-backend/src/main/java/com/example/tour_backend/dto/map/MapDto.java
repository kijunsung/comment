package com.example.tour_backend.dto.map;



import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@NoArgsConstructor
@Getter
@Setter

public class MapDto {
    private Long mapId;
    private Long scheduleId;
    private String location;
    private LocalDateTime createDate;

    @Builder
    public MapDto(Long mapId, Long scheduleId, String location, LocalDateTime createDate) {
        this.mapId = mapId;
        this.scheduleId = scheduleId;
        this.location = location;
        this.createDate = createDate;
    }
}
