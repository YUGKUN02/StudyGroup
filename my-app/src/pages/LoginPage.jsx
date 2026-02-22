// ===================================
// LoginPage.jsx - 로그인 페이지
// ===================================
// 역할: 사용자 로그인 처리
// - 아이디, 비밀번호 입력받기
// - 백엔드에 로그인 요청
// - 성공 시 토큰 저장 및 메인 페이지 이동

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { setUserFromToken, setUsername, setName } from "../store/userSlice";
import axiosInstance from '../api/axiosInstance';
import "../css/LoginPage.css";

function LoginPage() {
    // ========== 입력 필드 상태 관리 ==========
    const [emailInput, setEmailInput] = useState('');  // 아이디 입력값
    const [password, setPassword] = useState('');            // 비밀번호 입력값

    const navigate = useNavigate();  // 페이지 이동 함수
    const dispatch = useDispatch();  // Redux 상태 변경 함수

    // ========== 로그인 버튼 클릭 시 실행 ==========
    const handleLogin = async (e) => {
        e.preventDefault();  // 폼 새로고침 방지
        try {
            // 백엔드에 로그인 요청
            // 응답: accessToken + name 반환, refreshToken은 httpOnly 쿠키로 자동 설정
            const res = await axiosInstance.post('/api/auth/login',
                { email: emailInput, password }
            );

            console.log('로그인 응답:', res.data);  // 디버깅용
            console.log('name 값:', res.data.name);  // 디버깅용

            // Redux에 로그인 정보 저장
            dispatch(setUserFromToken(res.data.accessToken));  // 토큰 저장 + 로그인 상태 true
            dispatch(setUsername(emailInput));              // 아이디 저장(이메일)
            dispatch(setName(res.data.name));                  // 이름 저장

            alert('로그인 성공!');
            navigate('/');  // 메인 페이지로 이동
        } catch (err) {
            // 로그인 실패 (아이디/비밀번호 틀림, 서버 에러 등)
            alert('로그인 실패: ' + (err.response?.data || err.message));
        }
    };

    return (
        <div className="page-wrapper">
            <div className="auth-container">
                <h2>Study Mate</h2>

                {/* ========== 로그인 폼 ========== */}
                <form onSubmit={handleLogin}>
                    {/* 아이디 입력 */}
                    <input
                        type="email"
                        value={emailInput}
                        onChange={e => setEmailInput(e.target.value)}
                        placeholder="아이디(이메일)"
                        required
                    />
                    {/* 비밀번호 입력 */}
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="비밀번호"
                        required
                    />
                    {/* 로그인 버튼 */}
                    <button type="submit">로그인</button>
                </form>

                {/* 회원가입 페이지로 이동 링크 */}
                <p style={{ textAlign: 'center', marginTop: '1rem' }}>
                    계정이 없으신가요? <Link to="/signup" style={{ color: 'inherit', textDecoration: 'none', fontWeight: '500' }}>회원가입</Link>
                </p>

                {/* 비밀번호 찾기 링크 */}
                <p style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                    <Link to="/forgot-password" style={{ color: '#888', textDecoration: 'none', fontSize: '14px' }}>비밀번호를 잊으셨나요?</Link>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;
