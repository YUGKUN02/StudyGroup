// ===================================
// ForgotPassword.jsx - 비밀번호 찾기 페이지
// ===================================
// 역할: 3단계 비밀번호 재설정 프로세스
// Step 1: 이메일 입력 → 인증코드 발송
// Step 2: 인증코드 입력 → 코드 검증
// Step 3: 새 비밀번호 입력 → 비밀번호 변경

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import "../css/ForgotPassword.css";

function ForgotPassword() {
    // ========== 상태 관리 ==========
    const [step, setStep] = useState(1); // 현재 단계 (1: 이메일, 2: 코드, 3: 비밀번호)
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // ========== Step 1: 이메일로 인증코드 전송 ==========
    const handleSendCode = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            alert('이메일을 입력해주세요.');
            return;
        }

        setLoading(true);
        try {
            await axiosInstance.post('/api/auth/password-reset/request', { email });
            alert('인증코드가 이메일로 전송되었습니다. 메일을 확인해주세요.');
            setStep(2); // 다음 단계로 이동
        } catch (err) {
            const errorMsg = typeof err.response?.data === 'string'
                ? err.response.data
                : err.response?.data?.message || err.message || '알 수 없는 오류가 발생했습니다.';
            alert('오류: ' + errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // ========== Step 2: 인증코드 검증 ==========
    const handleVerifyCode = async (e) => {
        e.preventDefault();

        if (!code.trim()) {
            alert('인증코드를 입력해주세요.');
            return;
        }

        setLoading(true);
        try {
            await axiosInstance.post('/api/auth/password-reset/verify', {
                email,
                code
            });
            alert('이메일 인증이 완료되었습니다.');
            setStep(3); // 다음 단계로 이동
        } catch (err) {
            const errorMsg = typeof err.response?.data === 'string'
                ? err.response.data
                : err.response?.data?.message || err.message || '알 수 없는 오류가 발생했습니다.';
            alert('오류: ' + errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // ========== Step 3: 새 비밀번호로 변경 ==========
    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (!newPassword.trim()) {
            alert('새 비밀번호를 입력해주세요.');
            return;
        }

        if (newPassword !== confirmPassword) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }

        if (newPassword.length < 4) {
            alert('비밀번호는 최소 4자 이상이어야 합니다.');
            return;
        }

        setLoading(true);
        try {
            await axiosInstance.post('/api/auth/password-reset/reset', {
                email,
                newPassword
            });
            alert('비밀번호가 성공적으로 변경되었습니다. 로그인 페이지로 이동합니다.');
            navigate('/login');
        } catch (err) {
            const errorMsg = typeof err.response?.data === 'string'
                ? err.response.data
                : err.response?.data?.message || err.message || '알 수 없는 오류가 발생했습니다.';
            alert('오류: ' + errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-wrapper">
            <div className="auth-container">
                <h2>비밀번호 찾기</h2>

                {/* 진행 상황 표시 */}
                <div className="step-indicator">
                    <span className={step >= 1 ? 'active' : ''}>1. 이메일</span>
                    <span className={step >= 2 ? 'active' : ''}>2. 인증</span>
                    <span className={step >= 3 ? 'active' : ''}>3. 변경</span>
                </div>

                {/* ========== Step 1: 이메일 입력 ========== */}
                {step === 1 && (
                    <form onSubmit={handleSendCode}>
                        <p className="step-description">
                            가입하신 이메일 주소를 입력하세요.<br />
                            인증코드를 전송해드립니다.
                        </p>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="이메일 주소"
                            required
                            disabled={loading}
                        />
                        <button type="submit" disabled={loading}>
                            {loading ? '전송 중...' : '인증코드 전송'}
                        </button>
                    </form>
                )}

                {/* ========== Step 2: 인증코드 입력 ========== */}
                {step === 2 && (
                    <form onSubmit={handleVerifyCode}>
                        <p className="step-description">
                            <strong>{email}</strong>로 전송된<br />
                            6자리 인증코드를 입력하세요.
                        </p>
                        <input
                            type="text"
                            value={code}
                            onChange={e => setCode(e.target.value)}
                            placeholder="인증코드 (6자리)"
                            maxLength="6"
                            required
                            disabled={loading}
                        />
                        <button type="submit" disabled={loading}>
                            {loading ? '확인 중...' : '인증하기'}
                        </button>
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => setStep(1)}
                            disabled={loading}
                        >
                            이메일 다시 입력
                        </button>
                    </form>
                )}

                {/* ========== Step 3: 새 비밀번호 입력 ========== */}
                {step === 3 && (
                    <form onSubmit={handleResetPassword}>
                        <p className="step-description">
                            새로운 비밀번호를 입력하세요.
                        </p>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            placeholder="새 비밀번호"
                            required
                            disabled={loading}
                        />
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            placeholder="비밀번호 확인"
                            required
                            disabled={loading}
                        />
                        <button type="submit" disabled={loading}>
                            {loading ? '변경 중...' : '비밀번호 변경'}
                        </button>
                    </form>
                )}

                {/* 로그인 페이지로 돌아가기 */}
                <p style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <Link to="/login" style={{ color: '#888', textDecoration: 'none', fontSize: '14px' }}>
                        로그인 페이지로 돌아가기
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default ForgotPassword;
