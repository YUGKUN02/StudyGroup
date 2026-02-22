package com.example.demo.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudyResponseDTO {

    private Long id;
    private String title;
    private String description;

    private String status;
    private String category;
    private String schedule;
    private String location;
    private Integer recruitCount;
    private String curriculum;

    private String author;
    private Integer views;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private Boolean isTemp;   // ⭐ 임시저장 여부 추가
}