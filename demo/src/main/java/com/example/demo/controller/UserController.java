package com.example.demo.controller;

import com.example.demo.dto.LoginRequestDTO;
import com.example.demo.dto.LoginResponseDTO;
import com.example.demo.dto.UserRequestDTO;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.UserService;
import com.example.demo.util.JwtTokenProvider;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")

public class UserController {

    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    // localhost:8080/api/auth/signup로 요청이 들어왔을때 signup 함수 실행
    @PostMapping("/signup")
    public String signup(@RequestBody UserRequestDTO userRequestDTO) {
        userService.signUp(userRequestDTO);
        return "회원가입 성공!";
    }

    // localhost:8080/api/auth/login로 요청이 들어왔을때 login 함수 실행 -> 정상적으로 로그인됐다면 access,refresh 토큰 발급
    //@PostMapping("/login")
   // public LoginResponseDTO login(@RequestBody LoginRequestDTO loginRequestDTO) {
    //    return userService.login(loginRequestDTO);
    //}
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginRequestDTO request, HttpServletResponse response){
        LoginResponseDTO tokens = userService.login(request);

        Cookie refreshCookie = new Cookie("refreshToken",tokens.getRefreshToken());
        refreshCookie.setPath("/");
        refreshCookie.setHttpOnly(true);
        refreshCookie.setMaxAge(7*24*60*60);
        response.addCookie(refreshCookie);

        return  ResponseEntity.ok(new LoginResponseDTO(tokens.getAccessToken(),null, tokens.getName()));
    }

    // localhost:8080/api/auth/logout로 요청이 들어왔을때 logout 함수 실행
    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestHeader("Authorization") String accessToken,HttpServletResponse response){   // 클라이언트의 HTTP 요청 Header에서 "Authorization"값 가져옴
        String token = accessToken.replace("Bearer ","");   // "Bearer" 문자열을 제거후 순수 토큰만 추출
        String email = jwtTokenProvider.getEmailFromToken(token);
        User user = userRepository.findByEmail(email).orElseThrow(()-> new RuntimeException("사용자가 존재하지 않습니다"));

        user.setRefreshToken(null);
        userRepository.save(user);  // DB의 refresh토큰 비워서 accesstoken 못받게함 (로그아웃 했으니)

        Cookie refreshCookie = new Cookie("refreshToken",null);
        refreshCookie.setPath("/");
        refreshCookie.setHttpOnly(true);
        refreshCookie.setMaxAge(0);
        response.addCookie(refreshCookie);

        return ResponseEntity.ok("로그아웃 성공");
    }

    // localhost:8080/api/auth/refresh로  토큰 재발급 요청이 들어왔을때 refresh 함수 실행
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(HttpServletRequest request){
        String refreshToken = null;
        if(request.getCookies() != null){
            for(Cookie cookie : request.getCookies()){
                if(cookie.getName().equals("refreshToken")){
                    refreshToken = cookie.getValue();
                }
            }
        }
        if(refreshToken == null || !jwtTokenProvider.validateToken(refreshToken)){
            return  ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("유효하지 않은 리프레쉬 토큰 입니다.");

        }
        String email = jwtTokenProvider.getEmailFromToken(refreshToken);
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("사용자가 존재하지 않습니다."));
        if(!refreshToken.equals(user.getRefreshToken())){
            return  ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("서버에 저장된 리프레시 토큰과 다릅니다.");

        }
        String newAccessToken = jwtTokenProvider.generateAccessToken(email);
        return ResponseEntity.ok(new LoginResponseDTO(newAccessToken,null,user.getName()));
    }


}
