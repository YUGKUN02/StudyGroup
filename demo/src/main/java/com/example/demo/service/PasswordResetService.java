// src/main/java/com/example/demo/service/PasswordResetService.java
package com.example.demo.service;

import com.example.demo.dto.ForgotPasswordRequestDTO;
import com.example.demo.dto.ResetPasswordDTO;
import com.example.demo.dto.VerifyCodeDTO;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final MailService mailService;

    /** 이메일별 인증코드 저장 */
    private final Map<String, String> codeStorage = new ConcurrentHashMap<>();

    /** 인증이 끝난 이메일 표시용 */
    private final Map<String, Boolean> verifiedEmailStorage = new ConcurrentHashMap<>();

    // 1단계: 이메일로 인증코드 발송
    public void sendResetCode(ForgotPasswordRequestDTO dto) {

        // 이메일이 가입되어 있는지 확인
        userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new RuntimeException("가입된 사용자를 찾을 수 없습니다."));

        // 6자리 랜덤 코드 생성
        String code = String.valueOf(100000 + new Random().nextInt(900000));

        // 메모리에 저장
        codeStorage.put(dto.getEmail(), code);

        // 메일 발송
        mailService.sendResetCode(dto.getEmail(), code);
    }

    // 2단계: 코드 검증
    public void verifyCode(VerifyCodeDTO dto) {
        String savedCode = codeStorage.get(dto.getEmail());

        if (savedCode == null || !savedCode.equals(dto.getCode())) {
            throw new RuntimeException("인증코드가 올바르지 않습니다.");
        }

        // 코드가 맞으면 "이메일 인증 완료" 표시
        verifiedEmailStorage.put(dto.getEmail(), true);

        // 코드 자체는 더 이상 필요 없으니 제거
        codeStorage.remove(dto.getEmail());
    }

    // 3단계: 새 비밀번호로 변경
    public void resetPassword(ResetPasswordDTO dto) {

        // 코드 인증이 안 돼 있으면 막기
        Boolean verified = verifiedEmailStorage.get(dto.getEmail());
        if (verified == null || !verified) {
            throw new RuntimeException("먼저 이메일 인증을 완료해주세요.");
        }

        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        userRepository.save(user);

        // 한 번 쓴 인증은 제거
        verifiedEmailStorage.remove(dto.getEmail());
    }
}