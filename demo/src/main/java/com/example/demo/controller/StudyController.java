package com.example.demo.controller;

import com.example.demo.dto.StudyRequestDTO;
import com.example.demo.dto.StudyResponseDTO;
import com.example.demo.service.StudyService;
import com.example.demo.util.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/studies")
public class StudyController {

    private final StudyService studyService;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping
    public ResponseEntity<StudyResponseDTO> createStudy(
            @RequestBody StudyRequestDTO dto,
            @RequestHeader("Authorization") String token) {

        String email = jwtTokenProvider.getEmailFromToken(token.replace("Bearer ", ""));
        StudyResponseDTO response = studyService.createStudy(dto, email);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<StudyResponseDTO>> getAllStudies() {
        return ResponseEntity.ok(studyService.getAllStudies());
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudyResponseDTO> getStudyById(@PathVariable Long id) {
        return ResponseEntity.ok(studyService.getStudyById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudyResponseDTO> updateStudy(
            @PathVariable Long id,
            @RequestBody StudyRequestDTO dto,
            @RequestHeader("Authorization") String token) {

        String email = jwtTokenProvider.getEmailFromToken(token.replace("Bearer ", ""));
        return ResponseEntity.ok(studyService.updateStudy(id, dto, email));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteStudy(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {

        String email = jwtTokenProvider.getEmailFromToken(token.replace("Bearer ", ""));
        studyService.deleteStudy(id, email);
        return ResponseEntity.ok("스터디가 삭제되었습니다.");
    }

    @GetMapping("/my-posts")
    public ResponseEntity<List<StudyResponseDTO>> getMyPosts(
            @RequestHeader("Authorization") String token) {

        String email = jwtTokenProvider.getEmailFromToken(token.replace("Bearer ", ""));
        return ResponseEntity.ok(studyService.getMyPosts(email));
    }

    @GetMapping("/my-studies")
    public ResponseEntity<List<StudyResponseDTO>> getMyStudies(
            @RequestHeader("Authorization") String token) {

        String email = jwtTokenProvider.getEmailFromToken(token.replace("Bearer ", ""));
        return ResponseEntity.ok(studyService.getMyPosts(email));
    }

    // ⭐ 임시저장 저장
    @PostMapping("/temp")
    public ResponseEntity<StudyResponseDTO> saveTempStudy(
            @RequestBody StudyRequestDTO dto,
            @RequestHeader("Authorization") String token) {

        String email = jwtTokenProvider.getEmailFromToken(token.replace("Bearer ", ""));
        return ResponseEntity.ok(studyService.saveTempStudy(dto, email));
    }

    // ⭐ 최신 임시저장 불러오기
    @GetMapping("/temp/latest")
    public ResponseEntity<StudyResponseDTO> getLatestTempStudy(
            @RequestHeader("Authorization") String token) {

        String email = jwtTokenProvider.getEmailFromToken(token.replace("Bearer ", ""));
        return ResponseEntity.ok(studyService.getLatestTempStudy(email));
    }
}