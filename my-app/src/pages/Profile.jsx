// ===================================
// Profile.jsx - 사용자 프로필 페이지 (본인/다른 사용자 프로필 모두 지원)
// ===================================

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axiosInstance from "../api/axiosInstance";
import "../css/Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const { username } = useParams(); // URL 파라미터에서 username 가져오기
  
  // Redux에서 현재 로그인한 사용자 정보 가져오기
  const currentUser = useSelector((state) => state.user);
  const { name: currentUserName } = currentUser;
  
  // 상태 관리
  const [myStudies, setMyStudies] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [approvedStudies, setApprovedStudies] = useState([]); // ✅ 승인된 스터디 목록
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // 프로필 정보 상태
  const [profileInfo, setProfileInfo] = useState({
    name: "",
    email: "",
    joinDate: "",
    address: "",
    age: "",
    techStack: [],
    bio: ""
  });

  // 본인 프로필인지 확인
  const isOwnProfile = !username || username === currentUserName;
  const targetUsername = username || currentUserName;

  // 컴포넌트 마운트 시 데이터 불러오기
  useEffect(() => {
    if (targetUsername) {
      fetchUserData();
    }
  }, [targetUsername]);

  // ✅ 승인된 스터디 목록 가져오기
  const fetchApprovedStudies = async () => {
    try {
      // 내가 신청한 참여 목록 가져오기
      const participationsResponse = await axiosInstance.get("/api/participations/my-requests");
      const approvedParticipations = participationsResponse.data.filter(
        p => p.status === "APPROVED"
      );
      
      // 승인된 참여의 studyId로 스터디 정보 가져오기
      if (approvedParticipations.length > 0) {
        const allStudiesResponse = await axiosInstance.get("/api/studies");
        const approvedStudiesList = allStudiesResponse.data.filter(study =>
          approvedParticipations.some(p => String(p.studyId) === String(study.id))
        );
        setApprovedStudies(approvedStudiesList);
      } else {
        setApprovedStudies([]);
      }
    } catch (err) {
      console.error("승인된 스터디 목록 불러오기 실패:", err);
      setApprovedStudies([]);
    }
  };

  // 사용자 데이터 불러오기
  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // 본인 프로필인 경우
      if (isOwnProfile) {
        // 참여 중인 스터디 목록 가져오기
        const studiesResponse = await axiosInstance.get("/api/studies/my-studies");
        setMyStudies(studiesResponse.data);
        
        // 작성한 글 목록 가져오기
        const allStudiesResponse = await axiosInstance.get("/api/studies");
        const myPostsFiltered = allStudiesResponse.data.filter(
          study => study.author === currentUserName
        );
        setMyPosts(myPostsFiltered);
        
        // ✅ 승인된 스터디 목록 가져오기
        await fetchApprovedStudies();
        
        // 프로필 정보 가져오기
        try {
          const profileResponse = await axiosInstance.get("/api/users/profile");
          if (profileResponse.data) {
            setProfileInfo({
              name: currentUser.name,
              email: currentUser.email,
              joinDate: currentUser.joinDate,
              address: profileResponse.data.address || "",
              age: profileResponse.data.age || "",
              techStack: profileResponse.data.techStack || [],
              bio: profileResponse.data.bio || ""
            });
          }
        } catch (err) {
          console.log("프로필 정보 없음 또는 불러오기 실패:", err);
          setProfileInfo({
            name: currentUser.name,
            email: currentUser.email,
            joinDate: currentUser.joinDate,
            address: "",
            age: "",
            techStack: [],
            bio: ""
          });
        }
      } 
      // 다른 사용자 프로필인 경우
      else {
        // 해당 사용자의 공개 정보 가져오기
        try {
          const userProfileResponse = await axiosInstance.get(`/api/users/profile/${targetUsername}`);
          setProfileInfo(userProfileResponse.data);
          
          // 해당 사용자가 작성한 글 목록
          const allStudiesResponse = await axiosInstance.get("/api/studies");
          const userPostsFiltered = allStudiesResponse.data.filter(
            study => study.author === targetUsername
          );
          setMyPosts(userPostsFiltered);
          
          // 다른 사용자의 참여 스터디는 보이지 않음
          setMyStudies([]);
          setApprovedStudies([]);
        } catch (err) {
          console.error("사용자 프로필 불러오기 실패:", err);
          alert("사용자 정보를 불러올 수 없습니다.");
          navigate("/");
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error("데이터 불러오기 실패:", err);
      setLoading(false);
    }
  };

  // 프로필 수정 페이지로 이동 (본인만)
  const handleEditProfile = () => {
    navigate("/edit-profile", { 
      state: { 
        profileInfo 
      } 
    });
  };

  // 비밀번호 변경 페이지로 이동 (본인만)
  const handleChangePassword = () => {
    navigate("/change-password");
  };

  // 글 클릭 시 상세 페이지로 이동
  const handlePostClick = (postId) => {
    navigate(`/studies/${postId}`);
  };

  // 작성한 게시글 카드 클릭 핸들러 (본인만)
  const handleMyPostsClick = () => {
    if (isOwnProfile) {
      navigate("/studies", { state: { filterByAuthor: true } });
    }
  };

  // 참여중인 스터디 카드 클릭 핸들러 (본인만)
  const handleMyStudiesClick = () => {
    if (isOwnProfile) {
      navigate("/studies", { state: { filterByStudies: true } });
    }
  };

  // ✅ 스터디 그룹 카드 클릭 핸들러
  const handleStudyGroupsClick = () => {
    if (isOwnProfile) {
      navigate("/studies", { state: { filterByApproved: true } });
    }
  };

  // 검색 필터링
  const filteredPosts = myPosts.filter((post) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="profile-loading">로딩 중...</div>;
  }

  return (
    <div className="profile-container">
      {/* 프로필 헤더 */}
      <div className="profile-header">
        <div className="profile-avatar">
          <div className="profile-avatar-placeholder">
            {profileInfo.name ? profileInfo.name.charAt(0).toUpperCase() : "U"}
          </div>
        </div>
        
        <h1 className="profile-name">{profileInfo.name}</h1>
        {isOwnProfile && <p className="profile-email">{profileInfo.email}</p>}

      {/* 프로필 정보 섹션 */}
      <div className="profile-info-section">
        <h2 className="section-title">프로필 정보</h2>
        
        <div className="profile-info-card">
          <div className="profile-info-item">
            <div className="info-label">📍 주소</div>
            <div className="info-value">
              {profileInfo.address || "주소를 등록해주세요"}
            </div>
          </div>

          <div className="profile-info-item">
            <div className="info-label">🎂 나이</div>
            <div className="info-value">
              {profileInfo.age ? `${profileInfo.age}세` : "나이를 등록해주세요"}
            </div>
          </div>

          <div className="profile-info-item">
            <div className="info-label">💻 관심 분야</div>
            <div className="info-value">
              {profileInfo.techStack && profileInfo.techStack.length > 0 ? (
                <div className="tech-stack-tags">
                  {profileInfo.techStack.map((tech, index) => (
                    <span key={index} className="tech-tag">{tech}</span>
                  ))}
                </div>
              ) : (
                "기술 스택을 등록해주세요"
              )}
            </div>
          </div>

          <div className="profile-info-item">
            <div className="info-label">✏️ 자기소개</div>
            <div className="info-value">
              {profileInfo.bio || "자기소개를 작성해주세요"}
            </div>
          </div>
        </div>
      </div>

        {/* 본인 프로필인 경우에만 수정 버튼 표시 */}
        {isOwnProfile && (
          <div className="profile-buttons">
            <button className="profile-btn" onClick={handleEditProfile}>
              프로필 수정
            </button>
            <button className="profile-btn" onClick={handleChangePassword}>
              비밀번호 변경
            </button>
          </div>
        )}
      </div>

      {/* 활동 요약 */}
      <div className="activity-summary">
        <h2 className="section-title">
          {isOwnProfile ? "내 활동 요약" : `${profileInfo.name}님의 활동`}
        </h2>
        
        <div className="activity-cards">
          {/* 본인 프로필인 경우에만 참여 중인 스터디 표시 */}
          {isOwnProfile && (
            <div 
              className="activity-card"
              onClick={handleMyStudiesClick}
              style={{ cursor: 'pointer' }}
            >
              <h3 className="activity-card-title">참여 중인 스터디</h3>
              <p className="activity-card-count">{myStudies.length}개 스터디 활동 중</p>
            </div>
          )}

          <div 
            className="activity-card" 
            onClick={handleMyPostsClick}
            style={{ cursor: isOwnProfile ? 'pointer' : 'default' }}
          >
            <h3 className="activity-card-title">작성한 게시글</h3>
            <p className="activity-card-count">{myPosts.length}개 게시글 작성</p>
          </div>

          {/* ✅ 스터디 그룹 카드 (본인만) */}
          {isOwnProfile && (
            <div 
              className="activity-card"
              onClick={handleStudyGroupsClick}
              style={{ cursor: 'pointer' }}
            >
              <h3 className="activity-card-title">스터디 그룹</h3>
              <p className="activity-card-count">
                <span className="star-icon">👥</span> {approvedStudies.length}개 그룹 참여
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 작성한 글 */}
      <div className="my-posts-section">
        <div className="section-header">
          <h2 className="section-title">
            {isOwnProfile ? "내가 쓴 글" : `${profileInfo.name}님이 쓴 글`}
          </h2>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="no-posts">작성한 글이 없습니다.</div>
        ) : (
          <table className="posts-table">
            <thead>
              <tr>
                <th>No</th>
                <th>제목</th>
                <th>작성일</th>
                <th>조회수</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map((post, index) => (
                <tr 
                  key={post.id} 
                  onClick={() => handlePostClick(post.id)}
                  className="post-row"
                >
                  <td>{filteredPosts.length - index}</td>
                  <td className="post-title">{post.title}</td>
                  <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                  <td>{post.views || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="search-box">
          <input
            type="text"
            className="search-input"
            placeholder="제목으로 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="search-btn">🔍</button>
        </div>
      </div>
    </div>
  );
};

export default Profile;