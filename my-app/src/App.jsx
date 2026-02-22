// ===================================
// App.jsx - 메인 애플리케이션 컴포넌트
// ===================================
// 역할: 전체 앱의 구조와 라우팅 설정
// - 페이지 간 이동 경로 관리
// - 앱 시작 시 로그인 상태 확인

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import CreateStudy from './pages/CreateStudy';  // 추가
import Navbar from './components/Navbar';
import "./css/App.css";
import { useDispatch } from "react-redux";
import { setUserFromToken, setName } from "./store/userSlice";
import { useEffect } from 'react';
import StudyList from './pages/StudyList';
import StudyPage from './pages/StudyPage';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';

function App() {
  const dispatch = useDispatch(); // Redux 상태 변경을 위한 함수

  // ========== 앱 시작 시 자동 로그인 처리 ==========
  // 새로고침해도 로그인 상태 유지하기 위해
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const userName = localStorage.getItem("userName");
    if (token) {
      // 토큰이 있으면 Redux에 로그인 상태 저장
      dispatch(setUserFromToken(token));
      if (userName) {
        dispatch(setName(userName));
      }
    }
  }, [dispatch]);

  return (
    <Router>
      {/* 모든 페이지 상단에 표시되는 네비게이션 바 */}
      <Navbar />

      {/* 네비게이션 바 높이만큼 여백 추가 (겹침 방지) */}
      <div style={{ paddingTop: '80px' }}>
        {/* ========== 페이지 라우팅 설정 ========== */}
        <Routes>
          <Route path="/" element={<Home />} />              {/* 메인 페이지 */}
          <Route path="/signup" element={<SignupPage />} />  {/* 회원가입 페이지 */}
          <Route path="/login" element={<LoginPage />} />    {/* 로그인 페이지 */}
          <Route path="/forgot-password" element={<ForgotPassword />} /> {/* 비밀번호 찾기 페이지 */}
          <Route path="/create-study" element={<CreateStudy />} />  {/* 스터디 만들기 페이지 */}
          <Route path="/studies" element={<StudyList />} />  {/* 스터디 찾기 페이지 */}
          <Route path="/studies/:id" element={<StudyPage />} />  {/* 스터디 찾기 페이지 글 클릭하면 나오는 페이지 */}
          <Route path="/profile" element={<Profile />} /> {/*프로필 사진을 눌렀을 때 나오는 프로필 페이지*/}
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} /> {/*프로필 수정을 눌렀을 때 나오는 프로필 수정 페이지*/}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
