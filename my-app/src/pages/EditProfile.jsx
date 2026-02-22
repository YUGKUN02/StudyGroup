// ===================================
// EditProfile.jsx - 프로필 수정 페이지
// ===================================

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import axiosInstance from "../api/axiosInstance";
import "../css/EditProfile.css";

const EditProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { name, email } = useSelector((state) => state.user);

  // 프로필 정보 상태
  const [profileData, setProfileData] = useState({
    address: "",
    age: "",
    techStack: [],
    bio: ""
  });
  
  const [techInput, setTechInput] = useState("");
  const [loading, setLoading] = useState(false);

  // 컴포넌트 마운트 시 기존 프로필 데이터 로드
  useEffect(() => {
    if (location.state?.profileInfo) {
      setProfileData(location.state.profileInfo);
    } else {
      fetchProfileData();
    }
  }, []);

  // 프로필 데이터 불러오기
  const fetchProfileData = async () => {
    try {
      const response = await axiosInstance.get("/api/users/profile");
      if (response.data) {
        setProfileData({
          address: response.data.address || "",
          age: response.data.age || "",
          techStack: response.data.techStack || [],
          bio: response.data.bio || ""
        });
      }
    } catch (err) {
      console.log("프로필 정보 불러오기 실패:", err);
    }
  };

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 관심 분야 추가
  const handleAddTech = () => {
    if (techInput.trim() && !profileData.techStack.includes(techInput.trim())) {
      setProfileData(prev => ({
        ...prev,
        techStack: [...prev.techStack, techInput.trim()]
      }));
      setTechInput("");
    }
  };

  // 관심 분야 삭제
  const handleRemoveTech = (techToRemove) => {
    setProfileData(prev => ({
      ...prev,
      techStack: prev.techStack.filter(tech => tech !== techToRemove)
    }));
  };

  // Enter 키로 관심 분야 추가
  const handleTechKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTech();
    }
  };

  // 프로필 저장
  const handleSave = async () => {
    try {
      setLoading(true);
      
      await axiosInstance.put("/api/users/profile", profileData);
      
      alert("프로필이 수정되었습니다.");
      navigate("/profile");
    } catch (err) {
      console.error("프로필 수정 실패:", err);
      alert("프로필 수정에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 취소
  const handleCancel = () => {
    if (window.confirm("수정을 취소하시겠습니까?")) {
      navigate("/profile");
    }
  };

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-header">
        <h1 className="edit-profile-title">프로필 수정</h1>
        <p className="edit-profile-subtitle">나의 정보를 수정합니다</p>
      </div>

      <div className="edit-profile-form">
        {/* 기본 정보 (읽기 전용) */}
        <div className="form-section">
          <h3 className="form-section-title">기본 정보</h3>
          
          <div className="form-group">
            <label className="form-label">이름</label>
            <input
              type="text"
              value={name}
              className="form-input"
              disabled
              style={{ backgroundColor: '#f5f5f5' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">이메일</label>
            <input
              type="email"
              value={email}
              className="form-input"
              disabled
              style={{ backgroundColor: '#f5f5f5' }}
            />
          </div>
        </div>

        {/* 추가 정보 */}
        <div className="form-section">
          <h3 className="form-section-title">추가 정보</h3>
          
          <div className="form-group">
            <label className="form-label">📍 주소</label>
            <input
              type="text"
              name="address"
              value={profileData.address}
              onChange={handleChange}
              placeholder="예: 서울특별시 강남구"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">🎂 나이</label>
            <input
              type="number"
              name="age"
              value={profileData.age}
              onChange={handleChange}
              placeholder="예: 25"
              className="form-input"
              min="1"
              max="120"
            />
          </div>

          <div className="form-group">
            <label className="form-label">💻 관심 분야</label>
            <div className="tech-stack-input-wrapper">
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyPress={handleTechKeyPress}
                placeholder="예: 자기개발, 토익 (Enter로 추가)"
                className="form-input"
              />
              <button 
                type="button"
                onClick={handleAddTech}
                className="btn-add-tech"
              >
                추가
              </button>
            </div>
            
            {profileData.techStack.length > 0 && (
              <div className="tech-stack-list">
                {profileData.techStack.map((tech, index) => (
                  <span key={index} className="tech-tag-editable">
                    {tech}
                    <button
                      type="button"
                      onClick={() => handleRemoveTech(tech)}
                      className="btn-remove-tech"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">✏️ 자기소개</label>
            <textarea
              name="bio"
              value={profileData.bio}
              onChange={handleChange}
              placeholder="자신을 소개해주세요"
              className="form-textarea"
              rows="5"
            />
          </div>
        </div>

        {/* 버튼 그룹 */}
        <div className="form-actions">
          <button 
            onClick={handleCancel}
            className="btn-cancel"
            disabled={loading}
          >
            취소
          </button>
          <button 
            onClick={handleSave}
            className="btn-save"
            disabled={loading}
          >
            {loading ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;