package com.example.tour_backend.domain.weather;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WeatherRepository extends JpaRepository<Weather, Long> {
    // 필요 시, 특정 tourId에 속한 날씨 정보만 조회하려면 아래와 같은 메서드를 추가할 수 있습니다.
    // List<Weather> findByTourTourId(int tourId);
}
