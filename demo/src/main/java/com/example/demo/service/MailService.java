package com.example.demo.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;

    // 비밀번호 재설정용 인증코드 메일 보내기
    public void sendResetCode(String toEmail, String code) {
        SimpleMailMessage message = new SimpleMailMessage();

        // 보내는 사람 (이메일은 application.properties의 username과 같게)
        message.setFrom("StudyMate <chillelepallele2020@gmail.com>");

        // 받는 사람 = 가입한 유저 이메일
        message.setTo(toEmail);

        message.setSubject("[StudyMate] 비밀번호 재설정 인증코드");
        message.setText(
                "비밀번호 재설정을 위한 인증코드입니다.\n\n" +
                        "인증코드: " + code + "\n\n" +
                        "10분 안에 입력해주세요."
        );

        mailSender.send(message);
    }
}