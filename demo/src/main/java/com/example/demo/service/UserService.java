package com.example.demo.service;


import com.example.demo.dto.LoginRequestDTO;
import com.example.demo.dto.LoginResponseDTO;
import com.example.demo.dto.UserRequestDTO;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.util.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PostMapping;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    // 회원가입 함수
    public void signUp(UserRequestDTO userRequestDTO) {

        if (!isValidEmail(userRequestDTO.getEmail())) {
            throw new RuntimeException("올바른 이메일 형식이 아닙니다.");
        }

        if (!userRequestDTO.getPassword().equals(userRequestDTO.getPassword())) {
            throw new RuntimeException("비밀번호가 일치하지않습니다");
        }

        if (userRepository.findByEmail(userRequestDTO.getEmail()).isPresent()) {
            throw new RuntimeException("이미 존재하는 이메일입니다.");
        }

        User user = User.builder()
                .email(userRequestDTO.getEmail())
                .password(passwordEncoder.encode(userRequestDTO.getPassword()))
                .name(userRequestDTO.getName())
                .role("ROLE_USER")
                .build();

        userRepository.save(user);
    }

    // 이메일 형식 검증 헬퍼 메서드
    private boolean isValidEmail(String email){
        String emailRegex="^[A-Za-z0-9+_.-]+@(.+)$";
        return email != null && email.matches(emailRegex);
    }


    // 로그인 함수
    public LoginResponseDTO login(LoginRequestDTO request){

        User user = userRepository.findByEmail(request.getEmail()).orElseThrow(()->new RuntimeException("사용자 찾을수없습니다.")); //DB에서 username으로 사용자 검색, 없다면 예외발생

        if(!passwordEncoder.matches(request.getPassword(),user.getPassword())){ // 클라이언트가 입력한 평문 비밀번호("1234")를 암호화 한뒤  DB에 저장된 암호화된 비밀번호("2a$10")와 비교후 없다면 예외발생
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }

        String accessToken = jwtTokenProvider.generateAccessToken(user.getEmail());      //accessToken(API 호출용) 30분
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail());    //refreshToken(AccessToken 재발급용) 7일

        user.setRefreshToken(refreshToken);
        userRepository.save(user);  // RefreshToken을 DB에 저장

        return new LoginResponseDTO(accessToken,refreshToken,user.getName());  // 토큰 2개를 클라이언트에게 반환(로그인 성공했을때)

    }

    // ID 찾기

}
