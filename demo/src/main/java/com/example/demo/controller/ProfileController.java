package com.example.demo.controller;

import com.example.demo.dto.MyProfileResponseDto;
import com.example.demo.dto.ProfileResponseDto;
import com.example.demo.dto.ProfileUpdateRequestDto;
import com.example.demo.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    /**
     * 본인 프로필 조회
     * GET /api/users/profile
     */
    @GetMapping("/profile")
    public ResponseEntity<MyProfileResponseDto> getMyProfile(Authentication authentication) {
        String email = authentication.getName();
        MyProfileResponseDto profile = profileService.getMyProfile(email);
        return ResponseEntity.ok(profile);
    }

    /**
     * 다른 사용자 프로필 조회 (공개)
     * GET /api/users/profile/{username}
     */
    @GetMapping("/profile/{username}")
    public ResponseEntity<ProfileResponseDto> getPublicProfile(@PathVariable String username) {
        ProfileResponseDto profile = profileService.getPublicProfile(username);
        return ResponseEntity.ok(profile);
    }

    /**
     * 프로필 수정
     * PUT /api/users/profile
     */
    @PutMapping("/profile")
    public ResponseEntity<MyProfileResponseDto> updateProfile(
            Authentication authentication,
            @RequestBody ProfileUpdateRequestDto dto) {
        String email = authentication.getName();
        MyProfileResponseDto updatedProfile = profileService.updateProfile(email, dto);
        return ResponseEntity.ok(updatedProfile);
    }
}