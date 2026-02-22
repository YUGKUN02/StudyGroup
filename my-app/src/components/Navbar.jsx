// ===================================
// Navbar.jsx - 상단 네비게이션 바 컴포넌트
// ===================================
// 역할: 모든 페이지 상단에 표시되는 메뉴
// - 로고 및 사이트 제목
// - 로그인/회원가입 버튼
// - 스터디 찾기/만들기 버튼 (메인 섹션)
// - 사용자 이름 표시 및 로그아웃

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axiosInstance from "./../api/axiosInstance";
import { logout } from "../store/userSlice";
import logo from "../assets/logo.png";
import "../css/Navbar.css";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux에서 로그인 상태와 사용자 이름 가져오기
  const { isAuthenticated, name } = useSelector((state) => state.user);

  // ========== 로그아웃 처리 ==========
  const handleLogout = async () => {
    try {
      await axiosInstance.post("/api/auth/logout");
      dispatch(logout());
      alert("로그아웃 성공!");
      navigate("/");
    } catch (err) {
      console.error("서버 로그아웃 실패 : ", err);
      dispatch(logout());
      navigate("/");
    }
  };

  // ========== 스터디 찾기 ==========
  const handleFindStudy = () => {
    if (!isAuthenticated) {
      alert("로그인이 필요한 서비스입니다.");
      navigate("/login");
      return;
    }
    navigate("/studies");
  };

  // ========== 스터디 만들기 ==========
  const handleCreateStudy = () => {
    if (!isAuthenticated) {
      alert("로그인이 필요한 서비스입니다.");
      navigate("/login");
      return;
    }
    navigate("/create-study");
  };

  // ========== 프로필로 이동 ==========
  const handleProfileClick = () => {
    navigate("/profile");
  };

  return (
    <>
      {/* 상단 네비게이션 바 */}
      <nav className="navbar-top">
        {/* 로고 영역 */}
        <Link to="/" className="navbar-logo">
          <img src={logo} alt="Logo" className="navbar-logo-img" />
          Study Mate
        </Link>

        {/* 중앙 메뉴 영역 */}
        <div className="navbar-center">
          <button 
            className="navbar-center-link" 
            onClick={handleFindStudy}
          >
            스터디 찾기
          </button>
          <button 
            className="navbar-center-link" 
            onClick={handleCreateStudy}
          >
            스터디 만들기
          </button>
          <Link 
            className="navbar-center-link" 
            to="/my-studies"
          >
            후기
          </Link>
        </div>

        {/* 오른쪽 메뉴 영역 */}
        <div className="navbar-links">
          {!isAuthenticated ? (
            // ========== 로그인 안 한 경우: 로그인 + 회원가입 ==========
            <>
              <Link 
                className={`navbar-link ${location.pathname === "/login" ? "active" : ""}`} 
                to="/login"
              >
                로그인
              </Link>

            </>
          ) : (
            // ========== 로그인한 경우: 프로필 아이콘 + 이름 + 로그아웃 ==========
            <>
              <div className="navbar-user-info">
                <div 
                  className="navbar-profile-icon" 
                  onClick={handleProfileClick}
                  title="프로필로 이동"
                >
                  {/* 임시 프로필 아이콘 - 나중에 이미지로 교체 가능 */}
                  <div className="navbar-profile-placeholder">
                    {name ? name.charAt(0).toUpperCase() : "U"}
                  </div>
                </div>
                <span className="navbar-user-name">{name}님</span>
              </div>
              <button className="navbar-logout-btn" onClick={handleLogout}>
                로그아웃
              </button>
            </>
          )}
        </div>
      </nav>

      {/* 네비게이션 바 하단 구분선 */}
      <hr className="navbar-divider" />
    </>
  );
};

export default Navbar;