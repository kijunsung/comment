package com.example.tour_backend.service;

import com.example.tour_backend.domain.traffic.Traffic;
import com.example.tour_backend.domain.traffic.TrafficRepository;
import com.example.tour_backend.domain.tour.Tour;
import com.example.tour_backend.domain.tour.TourRepository;
import com.example.tour_backend.dto.traffic.TrafficDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrafficService {
    private final TrafficRepository trafficRepository;
    private final TourRepository tourRepository;

    @Transactional
    public TrafficDto createTraffic(TrafficDto dto) {
        Tour tour = tourRepository.findById(dto.getTourId())
                .orElseThrow(() -> new RuntimeException("여행 정보가 존재하지 않습니다."));

        Traffic traffic = Traffic.builder()
                .tour(tour)
                .vehicle(dto.getVehicle())
                .spendTime(dto.getSpendTime())
                .price(dto.getPrice())
                .build();

        trafficRepository.save(traffic);

        dto.setTrafficId(traffic.getTrafficId());
        return dto;
    }

    public Optional<TrafficDto> getTraffic(Long trafficId) {
        return trafficRepository.findById(trafficId)
                .map(t -> TrafficDto.builder()
                        .trafficId(t.getTrafficId())
                        .tourId(t.getTour().getTourId())
                        .vehicle(t.getVehicle())
                        .spendTime(t.getSpendTime())
                        .price(t.getPrice())
                        .build()
                );
    }

    public List<TrafficDto> getAllTraffics() {
        return trafficRepository.findAll().stream()
                .map(t -> TrafficDto.builder()
                        .trafficId(t.getTrafficId())
                        .tourId(t.getTour().getTourId())
                        .vehicle(t.getVehicle())
                        .spendTime(t.getSpendTime())
                        .price(t.getPrice())
                        .build()
                )
                .collect(Collectors.toList());
    }
}
