package com.example.demo.controller;

import com.example.demo.dto.CommentRequestDTO;
import com.example.demo.dto.CommentResponseDTO;
import com.example.demo.service.CommentService;
import com.example.demo.util.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/studies/{studyId}/comments")
public class CommentController {

    private final CommentService commentService;
    private final JwtTokenProvider jwtTokenProvider;

    // 댓글 작성
    @PostMapping
    public ResponseEntity<CommentResponseDTO> createComment(
            @PathVariable Long studyId,
            @RequestBody CommentRequestDTO dto,
            @RequestHeader("Authorization") String token) {

        String email = jwtTokenProvider.getEmailFromToken(token.replace("Bearer ", ""));
        CommentResponseDTO response = commentService.createComment(studyId, dto, email);
        return ResponseEntity.ok(response);
    }

    // 댓글 목록 조회
    @GetMapping
    public ResponseEntity<List<CommentResponseDTO>> getComments(@PathVariable Long studyId) {
        List<CommentResponseDTO> comments = commentService.getCommentsByStudyId(studyId);
        return ResponseEntity.ok(comments);
    }

    // 댓글 수정
    @PutMapping("/{commentId}")
    public ResponseEntity<CommentResponseDTO> updateComment(
            @PathVariable Long studyId,
            @PathVariable Long commentId,
            @RequestBody CommentRequestDTO dto,
            @RequestHeader("Authorization") String token) {

        String email = jwtTokenProvider.getEmailFromToken(token.replace("Bearer ", ""));
        CommentResponseDTO response = commentService.updateComment(commentId, dto, email);
        return ResponseEntity.ok(response);
    }

    // 댓글 삭제
    @DeleteMapping("/{commentId}")
    public ResponseEntity<String> deleteComment(
            @PathVariable Long studyId,
            @PathVariable Long commentId,
            @RequestHeader("Authorization") String token) {

        String email = jwtTokenProvider.getEmailFromToken(token.replace("Bearer ", ""));
        commentService.deleteComment(commentId, email);
        return ResponseEntity.ok("댓글이 삭제되었습니다.");
    }
}
