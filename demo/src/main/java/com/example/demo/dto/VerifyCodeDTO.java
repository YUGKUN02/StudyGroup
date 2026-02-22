// src/main/java/com/example/demo/dto/VerifyCodeDTO.java
package com.example.demo.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VerifyCodeDTO {
    private String email;
    private String code;
}