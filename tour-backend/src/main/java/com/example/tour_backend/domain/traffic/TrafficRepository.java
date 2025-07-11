package com.example.tour_backend.domain.traffic;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TrafficRepository extends JpaRepository<Traffic, Long> {
    // 필요 시, 예를 들어 특정 tourId에 속한 교통 수단만 조회하려면 아래와 같은 메서드를 추가할 수 있습니다.
    // List<Traffic> findByTourTourId(int tourId);
}