package com.example.demo.service;

import com.example.demo.dto.MyProfileResponseDto;
import com.example.demo.dto.ProfileResponseDto;
import com.example.demo.dto.ProfileUpdateRequestDto;
import com.example.demo.entity.Profile;
import com.example.demo.entity.ProfileTechStack;
import com.example.demo.entity.User;
import com.example.demo.repository.ProfileRepository;
import com.example.demo.repository.ProfileTechStackRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final ProfileTechStackRepository techStackRepository;
    private final UserRepository userRepository;

    /**
     * 본인 프로필 조회 (이메일 포함)
     */
    @Transactional(readOnly = true)
    public MyProfileResponseDto getMyProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 프로필이 없으면 기본값 반환
        Profile profile = profileRepository.findByUserId(user.getId())
                .orElse(null);

        List<String> techStack = List.of();
        if (profile != null) {
            techStack = techStackRepository.findByProfileId(profile.getId())
                    .stream()
                    .map(ProfileTechStack::getTech)
                    .collect(Collectors.toList());
        }

        // User 엔티티의 실제 필드명에 맞춰 수정
        // createdAt 필드가 없다면 profile.getCreatedAt() 사용


        LocalDateTime joinDate = null;
        if (profile != null && profile.getCreatedAt() != null) {
            joinDate = profile.getCreatedAt();
        }

        return MyProfileResponseDto.builder()
                .name(user.getName())
                .email(user.getEmail())
                .address(profile != null ? profile.getAddress() : null)
                .age(profile != null ? profile.getAge() : null)
                .bio(profile != null ? profile.getBio() : null)
                .techStack(techStack)
                .joinDate(joinDate)
                .build();
    }

    /**
     * 다른 사용자 프로필 조회 (공개 정보만)
     */
    @Transactional(readOnly = true)
    public ProfileResponseDto getPublicProfile(String username) {
        User user = userRepository.findByName(username)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        Profile profile = profileRepository.findByUserId(user.getId())
                .orElse(null);

        List<String> techStack = List.of();
        if (profile != null) {
            techStack = techStackRepository.findByProfileId(profile.getId())
                    .stream()
                    .map(ProfileTechStack::getTech)
                    .collect(Collectors.toList());
        }

        // User 엔티티의 실제 필드명에 맞춰 수정
        LocalDateTime joinDate = null;
        if (profile != null && profile.getCreatedAt() != null) {
            joinDate = profile.getCreatedAt();
        }

        return ProfileResponseDto.builder()
                .name(user.getName())
                .address(profile != null ? profile.getAddress() : null)
                .age(profile != null ? profile.getAge() : null)
                .bio(profile != null ? profile.getBio() : null)
                .techStack(techStack)
                .joinDate(joinDate)
                .build();
    }

    /**
     * 프로필 수정 (생성 또는 업데이트)
     */
    @Transactional
    public MyProfileResponseDto updateProfile(String email, ProfileUpdateRequestDto dto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 프로필이 없으면 생성, 있으면 업데이트
        Profile profile = profileRepository.findByUserId(user.getId())
                .orElse(Profile.builder()
                        .userId(user.getId())
                        .build());

        // 프로필 정보 업데이트
        if (dto.getAddress() != null) {
            profile.setAddress(dto.getAddress());
        }
        if (dto.getAge() != null) {
            profile.setAge(dto.getAge());
        }
        if (dto.getBio() != null) {
            profile.setBio(dto.getBio());
        }

        profile = profileRepository.save(profile);

        // 기술 스택 업데이트 (기존 삭제 후 재등록)
        if (dto.getTechStack() != null) {
            techStackRepository.deleteByProfileId(profile.getId());

            for (String tech : dto.getTechStack()) {
                ProfileTechStack techStack = ProfileTechStack.builder()
                        .profileId(profile.getId())
                        .tech(tech)
                        .build();
                techStackRepository.save(techStack);
            }
        }

        // 업데이트된 프로필 반환
        return getMyProfile(email);
    }
}