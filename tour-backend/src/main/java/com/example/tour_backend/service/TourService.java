package com.example.tour_backend.service;

import com.example.tour_backend.domain.tour.Tour;
import com.example.tour_backend.domain.tour.TourRepository;
import com.example.tour_backend.domain.user.User;
import com.example.tour_backend.domain.user.UserRepository;
import com.example.tour_backend.dto.tour.TourDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TourService {
    private final TourRepository tourRepository;
    private final UserRepository userRepository;

    @Transactional
    public TourDto createTour(TourDto dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("사용자가 존재하지 않습니다."));

        Tour tour = Tour.builder()
                .user(user)
                .title(dto.getTitle())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .build();

        tourRepository.save(tour);

        dto.setTourId(tour.getTourId());
        dto.setCreateDate(tour.getCreateDate());
        dto.setModifiedDate(tour.getModifiedDate());
        return dto;
    }

    public Optional<TourDto> getTour(Long tourId) {
        return tourRepository.findById(tourId)
                .map(t -> TourDto.builder()
                        .tourId(t.getTourId())
                        .userId(t.getUser().getUserId())
                        .title(t.getTitle())
                        .startDate(t.getStartDate())
                        .endDate(t.getEndDate())
                        .createDate(t.getCreateDate())
                        .modifiedDate(t.getModifiedDate())
                        .build()
                );
    }

    public List<TourDto> getAllTours() {
        return tourRepository.findAll().stream()
                .map(t -> TourDto.builder()
                        .tourId(t.getTourId())
                        .userId(t.getUser().getUserId())
                        .title(t.getTitle())
                        .startDate(t.getStartDate())
                        .endDate(t.getEndDate())
                        .createDate(t.getCreateDate())
                        .modifiedDate(t.getModifiedDate())
                        .build()
                )
                .collect(Collectors.toList());
    }
}
