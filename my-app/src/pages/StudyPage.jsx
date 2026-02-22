// ===================================
// StudyPage.jsx - 스터디 상세 페이지 (닉네임 클릭, 참여 신청, 모집완료 권한제어 포함)
// ===================================

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axiosInstance from "../api/axiosInstance";
import "../css/StudyPage.css";

const StudyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // Redux user state에서 필요한 정보 추출
  const { isAuthenticated, name } = useSelector((state) => state.user);

  const [study, setStudy] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedCommentContent, setEditedCommentContent] = useState("");

  // 참여 신청 목록 (스터디장 전용)
  const [participations, setParticipations] = useState([]);
  // 내가 이 스터디에 참여 신청한 정보 (일반 사용자용)
  const [myParticipation, setMyParticipation] = useState(null);

  // --------------------------------------------------------
  // 대댓글 기능 관련 상태
  // --------------------------------------------------------
  const [replyTargetId, setReplyTargetId] = useState(null);
  const [replyContent, setReplyContent] = useState("");

  // 날짜 포맷 함수: 2025.11.05 23:58
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

  // --------------------------------------------------------
  // 닉네임 클릭 시 프로필 페이지로 이동
  // --------------------------------------------------------
  const handleProfileClick = (username) => {
    navigate(`/profile/${username}`);
  };

  // --------------------------------------------------------
  // 댓글 목록을 다시 불러오는 함수
  // --------------------------------------------------------
  const fetchComments = useCallback(async () => {
    try {
      // 서버는 계층적 구조(replies 필드 포함)의 댓글을 반환해야 합니다.
      const res = await axiosInstance.get(`/api/studies/${id}/comments`);
      setComments(res.data);
    } catch (err) {
      console.error("댓글 불러오기 실패:", err);
    }
  }, [id]);

  // --------------------------------------------------------
  // 내가 신청한 참여 목록 중, 현재 스터디에 대한 것만 찾기
  // --------------------------------------------------------
  const fetchMyParticipation = useCallback(async () => {
    if (!isAuthenticated) {
      setMyParticipation(null);
      return;
    }

    try {
      const res = await axiosInstance.get("/api/participations/my-requests");
      const list = res.data || [];
      const found = list.find(
        (p) => String(p.studyId) === String(id)
      );
      setMyParticipation(found || null);
    } catch (err) {
      console.error("내 참여 신청 정보 불러오기 실패:", err);
      setMyParticipation(null);
    }
  }, [id, isAuthenticated]);

  // --------------------------------------------------------
  // 특정 스터디의 참여 신청 목록 (스터디장만)
  // --------------------------------------------------------
  const fetchParticipations = useCallback(async () => {
    if (!isAuthenticated || !study || name !== study.author) return;

    try {
      const res = await axiosInstance.get(
        `/api/studies/${id}/participations`
      );
      setParticipations(res.data || []);
    } catch (err) {
      console.error("참여 신청 목록 불러오기 실패:", err);
    }
  }, [id, isAuthenticated, name, study]);

  // --------------------------------------------------------
  // 스터디 상세 + 댓글 + 내 참여 정보 초기 로딩
  // --------------------------------------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studyRes] = await Promise.all([
          axiosInstance.get(`/api/studies/${id}`),
        ]);
        setStudy(studyRes.data);

        await fetchComments();        // 댓글
        await fetchMyParticipation(); // 내 참여 신청 정보
      } catch (err) {
        console.error("데이터 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, fetchComments, fetchMyParticipation]);

  // 스터디 정보가 준비된 후, 스터디장이면 참여 신청 목록도 불러오기
  useEffect(() => {
    fetchParticipations();
  }, [fetchParticipations]);

  // --------------------------------------------------------
  // 모집 상태 토글 (작성자만)
  // --------------------------------------------------------
  const handleToggleStatus = async () => {
    if (!isAuthenticated || !study || name !== study.author) {
      alert("작성자만 모집 상태를 변경할 수 있습니다.");
      return;
    }

    const newStatus = study.status === "모집중" ? "모집완료" : "모집중";

    try {
      const res = await axiosInstance.put(`/api/studies/${id}`, {
        ...study,
        status: newStatus,
      });
      setStudy(res.data);
      alert(`모집 상태가 '${newStatus}'로 변경되었습니다.`);
    } catch (err) {
      console.error("모집 상태 변경 실패:", err);
      alert("모집 상태 변경에 실패했습니다.");
    }
  };

  // --------------------------------------------------------
  // 참여 신청 (일반 사용자)
  // --------------------------------------------------------
  const handleJoinStudy = async () => {
    if (!isAuthenticated) {
      alert("로그인이 필요한 서비스입니다.");
      navigate("/login");
      return;
    }
    if (!study) return;

    // 모집완료인 스터디에는 신청 불가
    if (study.status === "모집완료") {
      alert("모집이 완료된 스터디입니다.");
      return;
    }

    // 이미 신청한 상태라면 안내
    if (myParticipation) {
      if (myParticipation.status === "PENDING") {
        alert("이미 이 스터디에 참여 신청을 해 두었습니다. 승인 대기 중입니다.");
      } else if (myParticipation.status === "APPROVED") {
        alert("이미 이 스터디 참여가 승인되었습니다.");
      } else if (myParticipation.status === "REJECTED") {
        alert("이 스터디의 참여 신청이 거절된 상태입니다.");
      }
      return;
    }

    const message = window.prompt(
      "참여 신청 메시지를 입력하세요. (생략 가능)",
      ""
    );

    if (window.confirm("이 스터디에 참여 신청하시겠습니까?")) {
      try {
        await axiosInstance.post(
          `/api/studies/${id}/participations`,
          { message: message || "" }
        );
        alert("참여 신청이 완료되었습니다!");
        await fetchMyParticipation(); // 내 상태 갱신
      } catch (err) {
        console.error("참여 신청 실패:", err);
        alert("참여 신청에 실패했습니다.");
      }
    }
  };

  // --------------------------------------------------------
  // 참여 신청 수락/거절 (스터디장)
  // --------------------------------------------------------
  const handleUpdateParticipation = async (participationId, newStatus) => {
    if (!isAuthenticated || !study || name !== study.author) {
      alert("작성자만 참여 신청을 관리할 수 있습니다.");
      return;
    }

    const actionText = newStatus === "APPROVED" ? "수락" : "거절";

    if (!window.confirm(`이 신청을 ${actionText}하시겠습니까?`)) return;

    try {
      await axiosInstance.put(
        `/api/studies/${id}/participations/${participationId}`,
        { status: newStatus } // ParticipationUpdateDTO: { status: "APPROVED" | "REJECTED" }
      );
      alert(`신청을 ${actionText}했습니다.`);
      await fetchParticipations(); // 목록 갱신
    } catch (err) {
      console.error("참여 신청 상태 변경 실패:", err);
      alert("참여 신청 상태 변경에 실패했습니다.");
    }
  };

  // --------------------------------------------------------
  // 원댓글 등록 (parentId: null)
  // --------------------------------------------------------
  const handleCommentSubmit = async () => {
    if (!isAuthenticated) {
      alert("로그인이 필요한 서비스입니다.");
      navigate("/login");
      return;
    }
    if (!newComment.trim()) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }
    try {
      await axiosInstance.post(`/api/studies/${id}/comments`, {
        content: newComment,
        parentId: null,
      });
      setNewComment("");
      await fetchComments();
    } catch (err) {
      console.error("댓글 작성 실패:", err);
      alert("댓글 작성에 실패했습니다.");
    }
  };

  // --------------------------------------------------------
  // 대댓글 등록 (parentId 사용)
  // --------------------------------------------------------
  const handleReplySubmit = async (parentId) => {
    if (!isAuthenticated) {
      alert("로그인이 필요한 서비스입니다.");
      navigate("/login");
      return;
    }
    if (!replyContent.trim()) {
      alert("답글 내용을 입력해주세요.");
      return;
    }
    try {
      await axiosInstance.post(`/api/studies/${id}/comments`, {
        content: replyContent,
        parentId: parentId,
      });
      setReplyContent("");
      setReplyTargetId(null);
      await fetchComments();
      alert("답글이 등록되었습니다.");
    } catch (err) {
      console.error("답글 작성 실패:", err);
      alert("답글 작성에 실패했습니다.");
    }
  };

  // --------------------------------------------------------
  // 게시글 수정: create-study 페이지로 이동
  // --------------------------------------------------------
  const handleEditStudy = () => {
    navigate("/create-study", {
      state: {
        mode: "edit",
        study,
      },
    });
  };

  // 게시글 삭제
  const handleDeleteStudy = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await axiosInstance.delete(`/api/studies/${id}`);
      alert("삭제되었습니다.");
      navigate("/studies");
    } catch (err) {
      console.error("삭제 실패:", err);
      alert("삭제에 실패했습니다.");
    }
  };

  // --------------------------------------------------------
  // 댓글 수정/삭제
  // --------------------------------------------------------
  const handleEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditedCommentContent(comment.content);
  };

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditedCommentContent("");
  };

  const handleSaveComment = async (commentId) => {
    if (!editedCommentContent.trim()) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }
    try {
      await axiosInstance.put(`/api/studies/${id}/comments/${commentId}`, {
        content: editedCommentContent,
      });
      await fetchComments();
      setEditingCommentId(null);
      setEditedCommentContent("");
      alert("수정되었습니다.");
    } catch (err) {
      console.error("댓글 수정 실패:", err);
      alert("댓글 수정에 실패했습니다.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;
    try {
      await axiosInstance.delete(`/api/studies/${id}/comments/${commentId}`);
      await fetchComments();
      alert("삭제되었습니다.");
    } catch (err) {
      console.error("댓글 삭제 실패:", err);
      alert("댓글 삭제에 실패했습니다.");
    }
  };

  // --------------------------------------------------------
  // 재귀 렌더링 함수 (대댓글 구조 렌더링)
  // --------------------------------------------------------
  const renderComment = (comment, depth = 0) => (
    <div
      key={comment.id}
      className={`comment-item depth-${depth}`}
      style={{
        marginLeft: depth > 0 ? depth * 20 : 0,
        paddingLeft: depth > 0 ? "10px" : "0",
        borderLeft: depth > 0 ? "3px solid #eee" : "none",
      }}
    >
      <div className="comment-header">
        <span
          className="comment-author"
          onClick={() => handleProfileClick(comment.author)}
          style={{
            cursor: "pointer",
            color: "#007bff",
            textDecoration: "none",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.target.style.textDecoration = "underline")}
          onMouseLeave={(e) => (e.target.style.textDecoration = "none")}
        >
          {comment.author} {depth > 0 && <span className="reply-marker">→</span>}
        </span>
        <span className="comment-date">{formatDate(comment.createdAt)}</span>

        {isAuthenticated &&
          (name === comment.author || (study && name === study.author)) && (
            <div style={{ marginLeft: "auto" }}>
              {editingCommentId === comment.id ? (
                <>
                  <button
                    onClick={() => handleSaveComment(comment.id)}
                    className="btn-icon"
                    style={{ marginRight: "5px" }}
                  >
                    💾 저장
                  </button>
                  <button
                    onClick={handleCancelEditComment}
                    className="btn-icon"
                  >
                    ❌ 취소
                  </button>
                </>
              ) : (
                <>
                  {name === comment.author && (
                    <button
                      onClick={() => handleEditComment(comment)}
                      className="btn-icon"
                      style={{ marginRight: "5px" }}
                    >
                      ✏️ 수정
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="btn-icon"
                  >
                    🗑️ 삭제
                  </button>
                </>
              )}
            </div>
          )}
      </div>

      {editingCommentId === comment.id ? (
        <textarea
          value={editedCommentContent}
          onChange={(e) => setEditedCommentContent(e.target.value)}
          className="comment-textarea"
          rows="3"
          style={{ width: "100%", marginTop: "10px" }}
        />
      ) : (
        <p className="comment-content">{comment.content}</p>
      )}

      {/* 답글 버튼 */}
      {isAuthenticated && depth < 2 && (
        <button
          className="btn-reply"
          onClick={() => {
            setReplyContent("");
            setReplyTargetId(
              replyTargetId === comment.id ? null : comment.id
            );
          }}
          disabled={editingCommentId !== null}
        >
          {replyTargetId === comment.id ? "❌ 답글 취소" : "💬 답글 달기"}
        </button>
      )}

      {/* 답글 입력창 */}
      {replyTargetId === comment.id && (
        <div className="reply-form">
          <textarea
            rows="2"
            className="comment-textarea"
            placeholder={`${comment.author}님에게 답글을 입력하세요...`}
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
          />
          <button
            className="btn-comment-submit"
            onClick={() => handleReplySubmit(comment.id)}
            disabled={!replyContent.trim()}
          >
            등록
          </button>
        </div>
      )}

      {/* 재귀 - replies 필드가 존재하고 내용이 있을 때만 렌더링 */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="comment-replies">
          {comment.replies.map((reply) => renderComment(reply, depth + 1))}
        </div>
      )}
    </div>
  );

  // --------------------------------------------------------
  // 로딩/에러 처리 + 권한 체크
  // --------------------------------------------------------
  if (loading) return <div className="loading">로딩 중...</div>;
  if (!study) return <div className="error">스터디를 찾을 수 없습니다.</div>;

  const isAuthor = isAuthenticated && name === study.author;
  const isApprovedMember =
    myParticipation && myParticipation.status === "APPROVED";

  // 모집완료 && 작성자도 아니고 승인된 인원도 아니면 -> 접근 차단
  if (study.status === "모집완료" && !isAuthor && !isApprovedMember) {
    return (
      <div className="error">
        이 스터디는 모집이 완료되었으며,
        <br />
        스터디장과 참여 신청 승인자만 상세 내용을 볼 수 있습니다.
      </div>
    );
  }

  // --------------------------------------------------------
  // 실제 렌더링
  // --------------------------------------------------------
  return (
    <div className="study-detail-container">
      <div className="study-header">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <h1 className="study-title" style={{ margin: 0 }}>
            {study.title}
          </h1>

          {/* 모집 상태 버튼 - 작성자만 클릭 가능 */}
          {isAuthor ? (
            <button
              onClick={handleToggleStatus}
              className="btn-status"
              style={{
                padding: "8px 16px",
                fontSize: "14px",
                fontWeight: "bold",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                backgroundColor:
                  study.status === "모집중" ? "#4CAF50" : "#f44336",
                color: "white",
                minWidth: "90px",
              }}
            >
              {study.status}
            </button>
          ) : (
            <span
              className="status-display"
              style={{
                padding: "8px 16px",
                fontSize: "14px",
                fontWeight: "bold",
                borderRadius: "5px",
                backgroundColor:
                  study.status === "모집중" ? "#4CAF50" : "#f44336",
                color: "white",
                minWidth: "90px",
                textAlign: "center",
                display: "inline-block",
              }}
            >
              {study.status}
            </span>
          )}
        </div>

        <div className="study-meta">
          <span className="meta-badge">{study.category}</span>
          <span className="meta-tag">{study.tags}</span>
          <span className="meta-tag">{study.hashtags}</span>
        </div>
        <div className="study-info-row">
          <span>
            작성자{" "}
            <span
              onClick={() => handleProfileClick(study.author)}
              style={{
                cursor: "pointer",
                color: "#007bff",
                textDecoration: "none",
                fontWeight: "bold",
              }}
              onMouseEnter={(e) =>
                (e.target.style.textDecoration = "underline")
              }
              onMouseLeave={(e) => (e.target.style.textDecoration = "none")}
            >
              {study.author}
            </span>
            {" · "}
            {formatDate(study.createdAt)} · 조회 {study.views}
          </span>
          <div className="study-actions-top">
            {isAuthor && (
              <>
                <button
                  onClick={handleEditStudy}
                  className="btn-icon"
                  style={{ marginRight: "5px" }}
                >
                  ✏️ 수정
                </button>
                <button onClick={handleDeleteStudy} className="btn-icon">
                  🗑️ 삭제
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 참여 신청 영역 */}
      <div className="join-section">
        {study.status === "모집완료" ? (
          <span className="join-closed-text">모집이 완료된 스터디입니다.</span>
        ) : (
          <button className="btn-join" onClick={handleJoinStudy}>
            참여 신청
          </button>
        )}
        {/* 내 신청 상태 표시 (선택사항이지만 있으면 편함) */}
        {myParticipation && (
          <div style={{ marginTop: "8px", fontSize: "13px", color: "#6b7280" }}>
            내 신청 상태:{" "}
            <span
              className={`status-pill status-${myParticipation.status.toLowerCase()}`}
            >
              {myParticipation.status === "PENDING"
                ? "대기중"
                : myParticipation.status === "APPROVED"
                ? "승인됨"
                : "거절됨"}
            </span>
          </div>
        )}
      </div>

      {/* 참여 신청 관리 - 스터디 작성자만 */}
      {isAuthor && (
        <div className="participation-section">
          <h3 className="section-subtitle">참여 신청 관리</h3>

          {participations.length === 0 ? (
            <p className="participation-empty">
              현재 들어온 참여 신청이 없습니다.
            </p>
          ) : (
            <ul className="participation-list">
              {participations.map((p) => (
                <li key={p.id} className="participation-item">
                  <div className="participation-main">
                    <span className="participation-user">{p.userName}</span>
                    <span
                      className={`status-pill status-${p.status.toLowerCase()}`}
                    >
                      {p.status === "PENDING"
                        ? "대기중"
                        : p.status === "APPROVED"
                        ? "승인됨"
                        : "거절됨"}
                    </span>
                  </div>

                  <div className="participation-sub">
                    <span className="participation-date">
                      신청일: {formatDate(p.createdAt)}
                    </span>
                    {p.message && (
                      <span className="participation-message">
                        메시지: {p.message}
                      </span>
                    )}
                  </div>

                  {p.status === "PENDING" && (
                    <div className="participation-actions">
                      <button
                        className="btn-approve"
                        onClick={() =>
                          handleUpdateParticipation(p.id, "APPROVED")
                        }
                      >
                        수락
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() =>
                          handleUpdateParticipation(p.id, "REJECTED")
                        }
                      >
                        거절
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

          <p className="participation-help">
            ※ 참여 신청을 수락하면 신청자의 상태가 '승인됨'으로 바뀌고,
            <br />
            모집완료 상태에서도 해당 사용자는 이 게시글을 계속 볼 수 있습니다.
          </p>
        </div>
      )}

      <div className="study-details">
        <div className="detail-row">
          <span className="detail-label">모임/시간:</span>
          <span className="detail-value">{study.schedule || "—"}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">방식:</span>
          <span className="detail-value">{study.location || "—"}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">모집 인원:</span>
          <span className="detail-value">{study.recruitCount || "—"}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">교재:</span>
          <span className="detail-value">{study.curriculum || "—"}</span>
        </div>
      </div>

      {study.imageUrl && (
        <div className="study-image">
          <img src={study.imageUrl} alt="스터디 이미지" />
        </div>
      )}

      <div className="study-description">
        <h3 className="description-title">상세 설명</h3>
        <p>{study.description || "상세 설명이 없습니다."}</p>
      </div>

      <div className="comments-section">
        <h3 className="comments-title">댓글 {comments.length}</h3>
        <div className="comments-list">
          {comments.map((comment) => renderComment(comment))}
        </div>

        <div className="comment-write">
          <textarea
            placeholder={
              isAuthenticated
                ? "댓글을 입력하세요..."
                : "로그인 후 댓글을 작성할 수 있습니다."
            }
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="comment-textarea"
            rows="3"
            disabled={!isAuthenticated}
          />
          <button
            onClick={handleCommentSubmit}
            className="btn-comment-submit"
            disabled={!isAuthenticated || !newComment.trim()}
          >
            등록
          </button>
        </div>
      </div>

      <div className="bottom-actions">
        <button onClick={() => navigate("/studies")} className="btn-back">
          목록으로 돌아가기
        </button>
      </div>
    </div>
  );
};

export default StudyDetail;
