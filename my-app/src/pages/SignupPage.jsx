import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import "../css/SignupPage.css";

function SignupPage() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();

  // 이메일 입력 시 실시간 검증
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
    if (value.trim() === '') {
      setEmailError('');
    } else if (!emailRegex.test(value.trim())) {
      setEmailError('유효한 이메일 주소를 입력하세요. (예: example@gmail.com)');
    } else {
      setEmailError('');
    }
  };

  // 회원가입 처리
  const handleSignup = async (e) => {
    e.preventDefault();

    // 이메일 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      setEmailError('유효한 이메일 주소를 입력하세요. (예: example@gmail.com)');
      return;
    }

    // 비밀번호 일치 여부 확인
    if (password !== passwordConfirm) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      await axiosInstance.post('/api/auth/signup', {
        email: email.trim(),
        password,
        passwordConfirm,
        name: name.trim(),
      });

      alert('회원가입 성공!');
      navigate('/login');
    } catch (err) {
      alert('회원가입 실패: ' + (err.response?.data || err.message));
    }
  };

  return (
    <div className="page-wrapper">
      <div className="auth-container">
        <h2>회원가입</h2>

        <form onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="아이디(이메일)"
            value={email}
            onChange={handleEmailChange}
            required
          />
          {/* ✅ 이메일 형식 에러 메세지 */}
          {emailError && (
            <p className="error-text">{emailError}</p>
          )}

          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="비밀번호 확인"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
          />

          <button type="submit">회원가입</button>
        </form>
      </div>
    </div>
  );
}

export default SignupPage;
