package com.example.tour_backend.dto.user;

import com.example.tour_backend.domain.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class JwtResponse {
    private String token;
    private Long userId;
    private String username;
    private Role role; // ✅ 추가
}

