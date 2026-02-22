package com.example.demo.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudyRequestDTO {

    private String title;
    private String description;

    private String status;        // 모집 상태
    private String category;      // 카테고리
    private String schedule;      // 일정
    private String location;      // 장소
    private Integer recruitCount; // 모집 인원
    private String curriculum;    // 커리큘럼
}