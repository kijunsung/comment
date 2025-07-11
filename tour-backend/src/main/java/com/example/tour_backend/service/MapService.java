package com.example.tour_backend.service;

import com.example.tour_backend.domain.mapentity.MapEntity;
import com.example.tour_backend.domain.mapentity.MapRepository;
import com.example.tour_backend.domain.schedule.Schedule;
import com.example.tour_backend.domain.schedule.ScheduleRepository;
import com.example.tour_backend.dto.map.MapDto;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MapService {
    private final MapRepository mapRepository;
    private final ScheduleRepository scheduleRepository;

    @Transactional
    public MapDto createMap(MapDto dto) {
        Schedule schedule = scheduleRepository.findById(dto.getScheduleId())
                .orElseThrow(() -> new RuntimeException("일정 정보가 존재하지 않습니다."));

        MapEntity map = MapEntity.builder()
                .schedule(schedule)
                .tour(schedule.getTour())
                .location(dto.getLocation())
                .createDate(dto.getCreateDate())
                .build();

        mapRepository.save(map);

        dto.setMapId(map.getMapId());
        return dto;
    }



    public Optional<MapDto> getMap(Long mapId) {
        return mapRepository.findById(mapId)
                .map(m -> MapDto.builder()
                        .mapId(m.getMapId())
                        .scheduleId(m.getSchedule().getScheduleId())
                        .location(m.getLocation())
                        .createDate(m.getCreateDate())
                        .build()
                );
    }

    public List<MapDto> getAllMaps() {
        return mapRepository.findAll().stream()
                .map(m -> MapDto.builder()
                        .mapId(m.getMapId())
                        .scheduleId(m.getSchedule().getScheduleId())
                        .location(m.getLocation())
                        .createDate(m.getCreateDate())
                        .build()
                )
                .collect(Collectors.toList());
    }
}
