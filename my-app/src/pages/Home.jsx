// ===================================
// Home.jsx - 메인 홈페이지
// ===================================
// 역할: 스터디 메이트의 랜딩/메인 페이지
// - 스터디 찾기/만들기 안내
// - 주요 기능으로 이동하는 버튼 제공

import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import studyImage from '../image/study_image.png';
import "../css/Home.css";

function Home() {
    const navigate = useNavigate();

    // Redux에 로그인 정보 저장되어 있다면 불러오기
    const isLoggedIn =
        useSelector((state) => state.user?.isLoggedIn) ||
        !!useSelector((state) => state.user?.accessToken) ||
        !!localStorage.getItem("accessToken"); // 토큰 저장 방식에 따라 조정

    // 공통 이동 함수 (로그인 안 돼 있으면 경고창 띄움)
    const guardedNavigate = (path) => {
        if (!isLoggedIn) {
            alert("로그인이 필요한 서비스입니다.");
            navigate("/login", { state: { from: path } }); // 로그인 페이지로 이동
            return;
        }
        navigate(path); // 로그인 상태라면 정상 이동
    };

    return (
        <div className="home-page">
            {/* 메인 */}
            <main className="home-main">
                <h1 className="main-title">함께 공부하고 성장하는 공간</h1>
                <p className="sub-title">스터디를 찾고, 새로운 동료를 만들어 보세요!</p>

                <div className="main-content">
                    <div className="image-box">
                        <img src={studyImage} alt="스터디 그룹 이미지" />
                    </div>

                    <div className="button-group">
                        <button
                            className="find-btn"
                            onClick={() => guardedNavigate('/studies')}
                        >
                            스터디 찾기
                        </button>
                        <button
                            className="create-btn"
                            onClick={() => guardedNavigate('/create-study')}
                        >
                            스터디 만들기
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Home;
