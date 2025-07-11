package com.example.tour_backend.service;

import com.example.tour_backend.domain.schedule.Schedule;
import com.example.tour_backend.domain.schedule.ScheduleRepository;
import com.example.tour_backend.domain.tour.Tour;
import com.example.tour_backend.domain.tour.TourRepository;
import com.example.tour_backend.dto.schedule.ScheduleDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScheduleService {
    private final ScheduleRepository scheduleRepository;
    private final TourRepository tourRepository;

    @Transactional
    public ScheduleDto createSchedule(ScheduleDto dto) {
        Tour tour = tourRepository.findById(dto.getTourId())
                .orElseThrow(() -> new RuntimeException("여행 정보가 존재하지 않습니다."));

        Schedule schedule = Schedule.builder()
                .tour(tour)
                .scheduleTitle(dto.getScheduleTitle())
                .content(dto.getContent())
                .date(dto.getDate())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .build();

        scheduleRepository.save(schedule);

        dto.setScheduleId(schedule.getScheduleId());
        dto.setCreateDate(schedule.getCreateDate());
        dto.setModifiedDate(schedule.getModifiedDate());
        return dto;
    }

    public Optional<ScheduleDto> getSchedule(Long scheduleid) {
        return scheduleRepository.findById(scheduleid)
                .map(s -> ScheduleDto.builder()
                        .scheduleId(s.getScheduleId())
                        .tourId(s.getTour().getTourId())
                        .scheduleTitle(s.getScheduleTitle())
                        .content(s.getContent())
                        .date(s.getDate())
                        .startTime(s.getStartTime())
                        .endTime(s.getEndTime())
                        .createDate(s.getCreateDate())
                        .modifiedDate(s.getModifiedDate())
                        .build()
                );
    }

    public List<ScheduleDto> getAllSchedules() {
        return scheduleRepository.findAll().stream()
                .map(s -> ScheduleDto.builder()
                        .scheduleId(s.getScheduleId())
                        .tourId(s.getTour().getTourId())
                        .scheduleTitle(s.getScheduleTitle())
                        .content(s.getContent())
                        .date(s.getDate())
                        .startTime(s.getStartTime())
                        .endTime(s.getEndTime())
                        .createDate(s.getCreateDate())
                        .modifiedDate(s.getModifiedDate())
                        .build()
                )
                .collect(Collectors.toList());
    }
}
