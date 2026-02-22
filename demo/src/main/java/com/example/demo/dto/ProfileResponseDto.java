package com.example.demo.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileResponseDto {
    private String name;
    private String address;
    private Integer age;
    private List<String> techStack;
    private String bio;
    private LocalDateTime joinDate;
}
