package com.example.demo.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProfileUpdateRequestDto {
    private String address;
    private Integer age;
    private List<String> techStack;
    private String bio;
}