package com.example.demo.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentRequestDTO {
    private String content;
    private Long parentId;  // 대댓글인 경우 부모 댓글 ID (null이면 원댓글)
}
