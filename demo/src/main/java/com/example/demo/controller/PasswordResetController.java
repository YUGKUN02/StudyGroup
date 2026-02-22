// src/main/java/com/example/demo/controller/PasswordResetController.java
package com.example.demo.controller;

import com.example.demo.dto.ForgotPasswordRequestDTO;
import com.example.demo.dto.ResetPasswordDTO;
import com.example.demo.dto.VerifyCodeDTO;
import com.example.demo.service.PasswordResetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    // 1단계: 비밀번호 재설정 코드 요청 (이메일로 코드 발송)
    @PostMapping("/password-reset/request")
    public ResponseEntity<String> sendResetCode(@RequestBody ForgotPasswordRequestDTO dto) {
        passwordResetService.sendResetCode(dto);
        return ResponseEntity.ok("인증코드가 이메일로 전송되었습니다.");
    }

    // 2단계: 코드 검증
    @PostMapping("/password-reset/verify")
    public ResponseEntity<String> verifyCode(@RequestBody VerifyCodeDTO dto) {
        passwordResetService.verifyCode(dto);
        return ResponseEntity.ok("이메일 인증이 완료되었습니다.");
    }

    // 3단계: 새 비밀번호로 변경
    @PostMapping("/password-reset/reset")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordDTO dto) {
        passwordResetService.resetPassword(dto);
        return ResponseEntity.ok("비밀번호가 성공적으로 변경되었습니다.");
    }
}