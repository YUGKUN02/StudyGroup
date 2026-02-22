package com.example.demo.dto;

import com.example.demo.entity.Participation.ParticipationStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParticipationUpdateDTO {
    private ParticipationStatus status; // APPROVED 또는 REJECTED
}
