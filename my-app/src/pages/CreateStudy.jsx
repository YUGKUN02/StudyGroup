// ===================================
// CreateStudy.jsx - 스터디 만들기 페이지 (전체 코드 완성본)
// ===================================

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import "../css/CreateStudy.css";

const CreateStudy = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 수정 모드일 경우 전달받은 게시글 정보
  const editingStudy = location.state?.study || null;
  const isEditMode = !!editingStudy;

  // 폼 상태 관리
  const [formData, setFormData] = useState(() => {
    if (editingStudy) {
      return {
        title: editingStudy.title || "",
        status: editingStudy.status || "모집중",
        category: editingStudy.category || "코딩",
        schedule: editingStudy.schedule || "",
        location: editingStudy.location || "",
        recruitCount: editingStudy.recruitCount || "",
        curriculum: editingStudy.curriculum || "",
        description: editingStudy.description || "",
      };
    }

    // 새 글 작성 기본값
    return {
      title: "",
      status: "모집중",
      category: "코딩",
      schedule: "",
      location: "",
      recruitCount: "",
      curriculum: "",
      description: "",
    };
  });

  // ⭐ 페이지 진입 시 최신 임시저장 불러오기 체크
  useEffect(() => {
    if (isEditMode) return; // 수정 모드면 임시저장 불러오기 안함

    axiosInstance
      .get("/api/studies/temp/latest")
      .then((res) => {
        if (res.data && res.data.isTemp === true) {
          const load = window.confirm(
            "임시저장된 글이 있습니다.\n불러오시겠습니까?"
          );

          if (load) {
            const t = res.data;
            setFormData({
              title: t.title || "",
              status: t.status || "모집중",
              category: t.category || "코딩",
              schedule: t.schedule || "",
              location: t.location || "",
              recruitCount: t.recruitCount || "",
              curriculum: t.curriculum || "",
              description: t.description || "",
            });
          }
        }
      })
      .catch((err) => {
        console.error("임시저장 불러오기 실패:", err);
      });
  }, [isEditMode]);

  // 입력값 변경
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 취소
  const handleCancel = () => {
    if (window.confirm("작성을 취소하시겠습니까?")) navigate("/");
  };

  // 임시 저장
  const handleTempSave = async () => {
    try {
      // ⭐ recruitCount를 숫자로 변환
      const submitData = {
        ...formData,
        recruitCount: formData.recruitCount ? parseInt(formData.recruitCount, 10) : null
      };
      await axiosInstance.post("/api/studies/temp", submitData);
      alert("임시저장되었습니다.");
      navigate("/");
    } catch (err) {
      console.error("임시저장 실패:", err);
      alert("임시저장에 실패했습니다.");
    }
  };

  // 등록 처리
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title) {
      alert("제목을 입력해주세요.");
      return;
    }
    if (!formData.recruitCount) {
      alert("모집인원을 입력해주세요.");
      return;
    }

    try {
      // ⭐ recruitCount를 숫자로 변환
      const submitData = {
        ...formData,
        recruitCount: formData.recruitCount ? parseInt(formData.recruitCount, 10) : null
      };

      if (isEditMode) {
        const response = await axiosInstance.put(
          `/api/studies/${editingStudy.id}`,
          submitData
        );
        const updatedStudy = response.data;
        alert("스터디가 수정되었습니다!");
        navigate(`/studies/${updatedStudy.id}`);
      } else {
        const response = await axiosInstance.post("/api/studies", submitData);
        const newStudy = response.data;
        alert("스터디가 등록되었습니다!");
        navigate("/studies", { state: { newStudy } });
      }
    } catch (err) {
      console.error("스터디 등록/수정 실패:", err);
      alert(
        isEditMode
          ? "스터디 수정에 실패했습니다."
          : "스터디 등록에 실패했습니다."
      );
    }
  };

  return (
    <div className="create-study-container">
      <h1 className="create-study-title">
        {isEditMode ? "스터디 모집글 수정" : "스터디 모집글 작성"}
      </h1>

      <form className="create-study-form" onSubmit={handleSubmit}>
        {/* 제목 */}
        <div className="form-group full-width">
          <label className="form-label">제목</label>
          <input
            type="text"
            name="title"
            className="form-input"
            placeholder="예: 취업 스터디 인원 모집합니다"
            value={formData.title}
            onChange={handleChange}
          />
        </div>

        {/* 모집 상태 / 카테고리 */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">모집 상태</label>
            <select
              name="status"
              className="form-select"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="모집중">모집중</option>
              <option value="모집완료">모집완료</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">카테고리</label>
            <select
              name="category"
              className="form-select"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="코딩">코딩</option>
              <option value="자격증">자격증</option>
              <option value="어학">어학</option>
              <option value="입시">입시</option>
              <option value="공무원">공무원</option>
              <option value="IT&개발">IT&개발</option>
              <option value="디자인">디자인</option>
              <option value="마케팅&기획">마케팅&기획</option>
              <option value="비즈니스&창업">비즈니스&창업</option>
            </select>
          </div>
        </div>

        {/* 모임/시간 / 방식 */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">모임/시간</label>
            <input
              type="text"
              name="schedule"
              className="form-input"
              placeholder="예: 매주 토요일 14:00"
              value={formData.schedule}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">방식</label>
            <input
              type="text"
              name="location"
              className="form-input"
              placeholder="예: 온라인 / 오프라인"
              value={formData.location}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* 모집 인원 / 교재 */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">모집 인원</label>
            <select
              name="recruitCount"
              className="form-select"
              value={formData.recruitCount}
              onChange={handleChange}
            >
              <option value="" disabled>
                인원을 선택하세요
              </option>
              {[...Array(9)].map((_, i) => {
                const value = i + 2;
                return (
                  <option key={value} value={value}>
                    {value}명
                  </option>
                );
              })}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">교재</label>
            <input
              type="text"
              name="curriculum"
              className="form-input"
              placeholder="예: 백준 알고리즘"
              value={formData.curriculum}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* 상세 설명 */}
        <div className="form-group full-width">
          <label className="form-label">상세 설명</label>
          <textarea
            name="description"
            className="form-textarea"
            rows="12"
            placeholder="스터디 설명을 입력해주세요."
            value={formData.description}
            onChange={handleChange}
          />
          <div className="char-count">{formData.description.length}/3000</div>
        </div>

        {/* 버튼 */}
        <div className="form-buttons">
          <button type="button" className="btn-cancel" onClick={handleCancel}>
            취소
          </button>
          <button type="button" className="btn-temp-save" onClick={handleTempSave}>
            임시저장
          </button>
          <button type="submit" className="btn-submit">
            {isEditMode ? "수정 완료" : "등록"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateStudy;