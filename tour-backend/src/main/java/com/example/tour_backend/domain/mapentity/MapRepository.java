package com.example.tour_backend.domain.mapentity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MapRepository extends JpaRepository<MapEntity, Long> {
    // scheduleId에 해당하는 Map(코스) 목록을 모두 가져오는 메서드
    List<MapEntity> findByScheduleScheduleId(Long scheduleId);
}