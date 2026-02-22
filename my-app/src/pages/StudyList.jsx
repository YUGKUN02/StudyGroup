import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import axiosInstance from "../api/axiosInstance";
import "../css/StudyList.css";

const StudyList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useSelector((state) => state.user);

  const [studies, setStudies] = useState([]);
  const [allStudies, setAllStudies] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  
  // ✅ 필터 적용 여부를 추적하는 ref
  const hasAppliedFilter = useRef(false);

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  };

  const fetchStudies = async () => {
    try {
      const response = await axiosInstance.get("/api/studies");
      setAllStudies(response.data);
      setStudies(response.data);
    } catch (err) {
      console.error("스터디 목록 불러오기 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudies();
  }, []);

  // ✅ 필터 적용 로직 분리 및 개선
  useEffect(() => {
    const applyFilter = async () => {
      const filterState = location.state;
      
      // 필터 상태가 없거나 이미 적용했으면 종료
      if (!filterState || hasAppliedFilter.current) return;
      
      try {
        if (filterState.filterByAuthor) {
          // 내가 작성한 글 필터
          const filtered = allStudies.filter(
            study => study.author === currentUser.name
          );
          setStudies(filtered);
        } else if (filterState.filterByStudies) {
          // 참여 중인 스터디 필터
          const studiesResponse = await axiosInstance.get("/api/studies/my-studies");
          setStudies(studiesResponse.data);
        } else if (filterState.filterByApproved) {
          // 승인된 스터디 필터
          const participationsResponse = await axiosInstance.get("/api/participations/my-requests");
          const approvedParticipations = participationsResponse.data.filter(
            p => p.status === "APPROVED"
          );
          
          if (approvedParticipations.length > 0) {
            const approvedStudiesList = allStudies.filter(study =>
              approvedParticipations.some(p => String(p.studyId) === String(study.id))
            );
            setStudies(approvedStudiesList);
          } else {
            setStudies([]);
          }
        }
        
        // ✅ 필터 적용 완료 표시
        hasAppliedFilter.current = true;
        
        // ✅ state 초기화는 다음 틱에 실행
        setTimeout(() => {
          navigate(location.pathname, { replace: true, state: {} });
        }, 0);
        
      } catch (err) {
        console.error("필터 적용 실패:", err);
      }
    };

    if (allStudies.length > 0 && location.state) {
      applyFilter();
    }
  }, [allStudies, location.state, currentUser.name]); // ✅ navigate, location.pathname 제거

  // ✅ location.pathname이 변경되면 필터 적용 플래그 초기화
  useEffect(() => {
    hasAppliedFilter.current = false;
  }, [location.pathname]);

  const handleSearch = () => {
    const keyword = searchKeyword.trim();

    if (!keyword) {
      setStudies(allStudies);
      return;
    }

    const lowerKeyword = keyword.toLowerCase();

    const filtered = allStudies.filter((study) => {
      const title = (study.title || "").toLowerCase();
      const category = (study.category || "").toLowerCase();
      const description = (study.description || "").toLowerCase();

      return (
        title.includes(lowerKeyword) ||
        category.includes(lowerKeyword) ||
        description.includes(lowerKeyword)
      );
    });

    setStudies(filtered);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleStudyClick = (studyId) => {
    navigate(`/studies/${studyId}`);
  };

  const handleWriteClick = () => {
    navigate("/create-study");
  };

  if (loading) return <div className="loading">로딩 중...</div>;

  return (
    <div className="study-list-container">
      <h1 className="study-list-title">STUDY 게시판</h1>

      <table className="study-table">
        <thead>
          <tr>
            <th>No</th>
            <th>제목</th>
            <th>모집 상태</th>
            <th>카테고리</th>
            <th>작성자</th>
            <th>작성시간</th>
          </tr>
        </thead>
        <tbody>
          {studies.length === 0 ? (
            <tr>
              <td colSpan="6" className="no-data">
                등록된 스터디가 없습니다.
              </td>
            </tr>
          ) : (
            studies.map((study, index) => (
              <tr
                key={study.id}
                onClick={() => handleStudyClick(study.id)}
                className="study-row"
              >
                <td>{studies.length - index}</td>
                <td className="study-title">{study.title}</td>
                <td>
                  <span
                    className={`status-badge ${
                      study.status === "모집중" ? "recruiting" : "completed"
                    }`}
                  >
                    {study.status || "모집중"}
                  </span>
                </td>
                <td>
                  <span className="category-badge">
                    {study.category || "기타"}
                  </span>
                </td>
                <td>{study.author || "익명"}</td>
                <td>{formatDate(study.createdAt)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="study-actions">
        <div className="search-box">
          <input
            type="text"
            placeholder="게시글 검색"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={handleKeyPress}
            className="search-input"
          />
          <button onClick={handleSearch} className="search-button">
            🔍
          </button>
        </div>
        <button onClick={handleWriteClick} className="write-button">
          글쓰기
        </button>
      </div>
    </div>
  );
};

export default StudyList;