package com.example.demo.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentResponseDTO {
    private Long id;
    private Long studyId;
    private String content;
    private String author;
    private Long parentId;  // 부모 댓글 ID (null이면 원댓글)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Builder.Default
    private List<CommentResponseDTO> replies = new ArrayList<>();  // 대댓글 목록
}
