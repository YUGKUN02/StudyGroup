package com.example.demo.controller;

import com.example.demo.dto.ParticipationRequestDTO;
import com.example.demo.dto.ParticipationResponseDTO;
import com.example.demo.dto.ParticipationUpdateDTO;
import com.example.demo.service.ParticipationService;
import com.example.demo.util.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class ParticipationController {

    private final ParticipationService participationService;
    private final JwtTokenProvider jwtTokenProvider;

    // 참여 신청 생성
    @PostMapping("/studies/{studyId}/participations")
    public ResponseEntity<ParticipationResponseDTO> createParticipation(
            @PathVariable Integer studyId,
            @RequestBody ParticipationRequestDTO dto,
            @RequestHeader("Authorization") String token) {

        String email = jwtTokenProvider.getEmailFromToken(token.replace("Bearer ", ""));
        ParticipationResponseDTO response = participationService.createParticipation(studyId, dto, email);
        return ResponseEntity.ok(response);
    }

    // 특정 스터디의 참여 신청 목록 조회 (스터디 작성자만)
    @GetMapping("/studies/{studyId}/participations")
    public ResponseEntity<List<ParticipationResponseDTO>> getParticipationsByStudyId(
            @PathVariable Integer studyId,
            @RequestHeader("Authorization") String token) {

        String email = jwtTokenProvider.getEmailFromToken(token.replace("Bearer ", ""));
        List<ParticipationResponseDTO> participations = participationService.getParticipationsByStudyId(studyId, email);
        return ResponseEntity.ok(participations);
    }

    // 내가 신청한 참여 목록 조회
    @GetMapping("/participations/my-requests")
    public ResponseEntity<List<ParticipationResponseDTO>> getMyParticipations(
            @RequestHeader("Authorization") String token) {

        String email = jwtTokenProvider.getEmailFromToken(token.replace("Bearer ", ""));
        List<ParticipationResponseDTO> myParticipations = participationService.getMyParticipations(email);
        return ResponseEntity.ok(myParticipations);
    }

    // 참여 신청 승인/거절 (스터디 작성자만)
    @PutMapping("/studies/{studyId}/participations/{participationId}")
    public ResponseEntity<ParticipationResponseDTO> updateParticipationStatus(
            @PathVariable Integer studyId,
            @PathVariable Integer participationId,
            @RequestBody ParticipationUpdateDTO dto,
            @RequestHeader("Authorization") String token) {

        String email = jwtTokenProvider.getEmailFromToken(token.replace("Bearer ", ""));
        ParticipationResponseDTO response = participationService.updateParticipationStatus(studyId, participationId, dto, email);
        return ResponseEntity.ok(response);
    }

    // 참여 신청 취소 (신청자 본인만)
    @DeleteMapping("/studies/{studyId}/participations/{participationId}")
    public ResponseEntity<String> deleteParticipation(
            @PathVariable Integer studyId,
            @PathVariable Integer participationId,
            @RequestHeader("Authorization") String token) {

        String email = jwtTokenProvider.getEmailFromToken(token.replace("Bearer ", ""));
        participationService.deleteParticipation(studyId, participationId, email);
        return ResponseEntity.ok("참여 신청이 취소되었습니다.");
    }
}
