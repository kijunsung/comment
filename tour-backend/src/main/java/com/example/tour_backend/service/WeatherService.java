package com.example.tour_backend.service;

import com.example.tour_backend.domain.tour.Tour;
import com.example.tour_backend.domain.tour.TourRepository;
import com.example.tour_backend.domain.weather.Weather;
import com.example.tour_backend.domain.weather.WeatherRepository;
import com.example.tour_backend.dto.weather.WeatherDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WeatherService {
    private final WeatherRepository weatherRepository;
    private final TourRepository tourRepository;

    @Transactional
    public WeatherDto createWeather(WeatherDto dto) {
        Tour tour = tourRepository.findById(dto.getTourId())
                .orElseThrow(() -> new RuntimeException("여행 정보가 존재하지 않습니다."));

        Weather weather = Weather.builder()
                .tour(tour)
                .temperature(dto.getTemperature())
                .description(dto.getDescription())
                .createDate(dto.getCreateDate())
                .modifiedDate(dto.getModifiedDate())
                .build();

        weatherRepository.save(weather);

        dto.setWeatherId(weather.getWeatherId());
        return dto;
    }

    public Optional<WeatherDto> getWeather(Long weatherId) {
        return weatherRepository.findById(weatherId)
                .map(w -> WeatherDto.builder()
                        .weatherId(w.getWeatherId())
                        .tourId(w.getTour().getTourId())
                        .temperature(w.getTemperature())
                        .description(w.getDescription())
                        .createDate(w.getCreateDate())
                        .modifiedDate(w.getModifiedDate())
                        .build()
                );
    }

    public List<WeatherDto> getAllWeathers() {
        return weatherRepository.findAll().stream()
                .map(w -> WeatherDto.builder()
                        .weatherId(w.getWeatherId())
                        .tourId(w.getTour().getTourId())
                        .temperature(w.getTemperature())
                        .description(w.getDescription())
                        .createDate(w.getCreateDate())
                        .modifiedDate(w.getModifiedDate())
                        .build()
                )
                .collect(Collectors.toList());
    }
}
