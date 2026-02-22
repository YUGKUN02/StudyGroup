import axios from "axios";

// ===================================
// 백엔드 API 통신을 위한 axios 설정 파일
// ===================================
// 사용법: import axiosInstance from '@/api/axiosInstance';
//        axiosInstance.get('/api/study-groups')
//        axiosInstance.post('/api/users', { name: '홍길동' })

// axios 인스턴스 생성 (모든 API 요청에 사용)
const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080',  // 백엔드 서버 주소 (나중에 배포 시 변경 필요)
    withCredentials: true               // 쿠키를 자동으로 포함 (refreshToken 전송용)
});

// ===================================
// 요청 인터셉터: API 요청을 보내기 전에 실행됨
// ===================================
// 역할: 저장된 accessToken을 자동으로 헤더에 추가
axiosInstance.interceptors.request.use(
    (config) => {
        // localStorage에서 accessToken 가져오기
        const token = localStorage.getItem('accessToken');
        if (token) {
            // 헤더에 토큰 추가 (백엔드에서 인증용으로 사용)
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ===================================
// 응답 인터셉터: API 응답을 받은 후 실행됨
// ===================================
// 역할: 토큰이 만료되었을 때 자동으로 재발급 처리
axiosInstance.interceptors.response.use(
    (res) => res, // 성공 응답은 그대로 반환
    async (err) => {
        const originalRequest = err.config; // 실패한 원래 요청 정보

        // 401 에러 = 토큰 만료 or 인증 실패
        // _retry가 없으면 = 아직 재시도 안 한 요청
        if (err.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // 재시도 표시 (무한 루프 방지)

            try {
                // ========== 토큰 재발급 요청 ==========
                // refreshToken(쿠키)으로 새 accessToken 받기
                const res = await axios.post(
                    "http://localhost:8080/api/auth/refresh",
                    {},
                    { withCredentials: true } // refreshToken 쿠키 자동 전송
                );

                // 새로 받은 accessToken 저장
                const newAccessToken = res.data.accessToken;
                localStorage.setItem("accessToken", newAccessToken);

                // 실패했던 요청에 새 토큰 적용
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                // 원래 요청을 새 토큰으로 다시 시도
                return axiosInstance(originalRequest);

            } catch (refreshError) {
                // ========== 토큰 재발급 실패 ==========
                // refreshToken도 만료되었거나 유효하지 않음
                console.log("refresh 실패:", refreshError);
                localStorage.removeItem("accessToken"); // 토큰 삭제
                window.location.href = "/login";        // 로그인 페이지로 이동
                return Promise.reject(refreshError);
            }
        }

        // 401이 아닌 다른 에러는 그대로 반환
        return Promise.reject(err);
    }
)

export default axiosInstance;