package com.example.tour_backend.service;

import com.example.tour_backend.domain.thread.ThreadRepository;
import com.example.tour_backend.domain.user.UserRepository;
import com.example.tour_backend.domain.report.ReportRepository;
import com.example.tour_backend.dto.StatisticsResponseDto;
import com.example.tour_backend.dto.user.UserResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final UserRepository userRepository;
    private final ThreadRepository threadRepository;
    private final ReportRepository reportRepository;

    /** 시스템 전체 통계 조회 */
    public StatisticsResponseDto getStatistics() {
        long userCount   = userRepository.count();
        long threadCount = threadRepository.count();
        long reportCount = reportRepository.count();
        return new StatisticsResponseDto(userCount, threadCount, reportCount);
    }

    /** 유저 리스트 조회 (검색/정렬 파라미터 포함) */
    public List<UserResponseDto> getUsers(String searchType, String keyword, String sortBy) {
        Sort sort = Sort.by(Sort.Direction.DESC, sortBy);

        List<com.example.tour_backend.domain.user.User> list;
        if (keyword != null && !keyword.isBlank()) {
            if ("email".equals(searchType)) {
                list = userRepository.findByEmailContaining(keyword, sort);
            } else {
                list = userRepository.findByNameContaining(keyword, sort);
            }
        } else {
            list = userRepository.findAll(sort);
        }

        return list.stream()
                .map(UserResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    /** 유저 삭제 */
    @Transactional
    public void deleteUser(Long userId) {
        userRepository.deleteById(userId);
    }
}
