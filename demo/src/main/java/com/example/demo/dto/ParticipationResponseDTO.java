package com.example.demo.dto;

import com.example.demo.entity.Participation.ParticipationStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParticipationResponseDTO {
    private Integer id;
    private Integer studyId;
    private Integer userId;
    private String userName;        // 신청자 이름
    private String studyTitle;      // 스터디 제목
    private ParticipationStatus status;
    private String message;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
