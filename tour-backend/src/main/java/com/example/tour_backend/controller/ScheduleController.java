package com.example.tour_backend.controller;

import com.example.tour_backend.domain.schedule.Schedule;
import com.example.tour_backend.domain.tour.TourRepository;
import com.example.tour_backend.domain.schedule.ScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.sql.Timestamp;
import java.util.List;

@RestController
@RequestMapping("/api/schedules")
@RequiredArgsConstructor
public class ScheduleController {
    private final ScheduleRepository scheduleRepository;
    private final TourRepository tourRepository;

    @GetMapping
    public List<Schedule> getAll() {
        return scheduleRepository.findAll();
    }

    @GetMapping("/{id}")
    public Schedule getById(@PathVariable Long id) {
        return scheduleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Schedule not found"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Schedule create(@RequestBody Schedule schedule) {
        Timestamp now = new Timestamp(System.currentTimeMillis());
        schedule.setCreateDate(now.toLocalDateTime());
        schedule.setModifiedDate(now.toLocalDateTime());
        return scheduleRepository.save(schedule);
    }

    @PutMapping("/{id}")
    public Schedule update(@PathVariable Long id, @RequestBody Schedule updated) {
        return scheduleRepository.findById(id).map(s -> {
            s.setScheduleTitle(updated.getScheduleTitle());
            s.setContent(updated.getContent());
            s.setDate(updated.getDate());
            s.setStartTime(updated.getStartTime());
            s.setEndTime(updated.getEndTime());
            s.setModifiedDate(new Timestamp(System.currentTimeMillis()).toLocalDateTime());
            return scheduleRepository.save(s);
        }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Schedule not found"));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        scheduleRepository.deleteById(id);
    }
}
