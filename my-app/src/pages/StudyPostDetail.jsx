import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    getStudyPost,
    deleteStudyPost,
    getPostComments,
    createPostComment,
    deletePostComment
} from '../api/studyPost';
import '../css/StudyPostDetail.css';

const StudyPostDetail = () => {
    const { studyId, postId } = useParams();
    const navigate = useNavigate();
    const currentUser = useSelector((state) => state.user.user);

    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentContent, setCommentContent] = useState('');
    const [replyTo, setReplyTo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPost();
        fetchComments();
    }, [studyId, postId]);

    const fetchPost = async () => {
        try {
            setLoading(true);
            const data = await getStudyPost(studyId, postId);
            setPost(data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || '게시글을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async () => {
        try {
            const data = await getPostComments(studyId, postId);
            setComments(data);
        } catch (err) {
            console.error('댓글 로딩 실패:', err);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('정말 삭제하시겠습니까?')) return;

        try {
            await deleteStudyPost(studyId, postId);
            alert('게시글이 삭제되었습니다.');
            navigate(`/studies/${studyId}/board`);
        } catch (err) {
            alert(err.response?.data?.message || '삭제에 실패했습니다.');
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentContent.trim()) return;

        try {
            await createPostComment(studyId, postId, {
                content: commentContent,
                parentId: replyTo
            });
            setCommentContent('');
            setReplyTo(null);
            fetchComments();
        } catch (err) {
            alert(err.response?.data?.message || '댓글 작성에 실패했습니다.');
        }
    };

    const handleCommentDelete = async (commentId) => {
        if (!window.confirm('댓글을 삭제하시겠습니까?')) return;

        try {
            await deletePostComment(studyId, postId, commentId);
            fetchComments();
        } catch (err) {
            alert(err.response?.data?.message || '댓글 삭제에 실패했습니다.');
        }
    };

    const getPostTypeLabel = (type) => {
        switch (type) {
            case 'NOTICE': return '공지';
            case 'DISCUSSION': return '토론';
            case 'ASSIGNMENT': return '과제';
            case 'GENERAL': return '일반';
            default: return type;
        }
    };

    const getPostTypeBadgeClass = (type) => {
        switch (type) {
            case 'NOTICE': return 'badge-notice';
            case 'DISCUSSION': return 'badge-discussion';
            case 'ASSIGNMENT': return 'badge-assignment';
            case 'GENERAL': return 'badge-general';
            default: return '';
        }
    };

    // 대댓글 구조 생성
    const organizeComments = () => {
        const commentMap = {};
        const rootComments = [];

        comments.forEach(comment => {
            commentMap[comment.id] = { ...comment, replies: [] };
        });

        comments.forEach(comment => {
            if (comment.parentId) {
                if (commentMap[comment.parentId]) {
                    commentMap[comment.parentId].replies.push(commentMap[comment.id]);
                }
            } else {
                rootComments.push(commentMap[comment.id]);
            }
        });

        return rootComments;
    };

    const renderComment = (comment, depth = 0) => (
        <div key={comment.id} className={`comment ${depth > 0 ? 'reply' : ''}`}>
            <div className="comment-header">
                <strong>{comment.authorName}</strong>
                <span className="comment-date">
                    {new Date(comment.createdAt).toLocaleString()}
                </span>
            </div>
            <div className="comment-content">{comment.content}</div>
            <div className="comment-actions">
                <button onClick={() => setReplyTo(comment.id)} className="btn-reply">
                    답글
                </button>
                {currentUser?.id === comment.authorId && (
                    <button onClick={() => handleCommentDelete(comment.id)} className="btn-delete-comment">
                        삭제
                    </button>
                )}
            </div>
            {comment.replies && comment.replies.length > 0 && (
                <div className="replies">
                    {comment.replies.map(reply => renderComment(reply, depth + 1))}
                </div>
            )}
        </div>
    );

    if (loading) return <div className="loading">로딩 중...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!post) return <div className="error-message">게시글을 찾을 수 없습니다.</div>;

    return (
        <div className="study-post-detail-container">
            <div className="post-header">
                <div className="post-title-section">
                    <span className={`post-type-badge ${getPostTypeBadgeClass(post.postType)}`}>
                        {getPostTypeLabel(post.postType)}
                    </span>
                    <h2>{post.title}</h2>
                </div>
                <div className="post-meta">
                    <span>{post.authorName}</span>
                    <span>{new Date(post.createdAt).toLocaleString()}</span>
                    <span>조회 {post.views}</span>
                </div>
            </div>

            <div className="post-content">
                {post.content}
            </div>

            <div className="post-actions">
                <button onClick={() => navigate(`/studies/${studyId}/board`)} className="btn-list">
                    목록
                </button>
                {currentUser?.id === post.authorId && (
                    <>
                        <button onClick={() => navigate(`/studies/${studyId}/posts/${postId}/edit`)} className="btn-edit">
                            수정
                        </button>
                        <button onClick={handleDelete} className="btn-delete">
                            삭제
                        </button>
                    </>
                )}
            </div>

            <div className="comments-section">
                <h3>댓글 ({comments.length})</h3>

                <form onSubmit={handleCommentSubmit} className="comment-form">
                    {replyTo && (
                        <div className="reply-indicator">
                            답글 작성 중
                            <button type="button" onClick={() => setReplyTo(null)}>취소</button>
                        </div>
                    )}
                    <textarea
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        placeholder="댓글을 입력하세요"
                        rows="3"
                    />
                    <button type="submit" className="btn-submit-comment">
                        댓글 작성
                    </button>
                </form>

                <div className="comments-list">
                    {organizeComments().map(comment => renderComment(comment))}
                </div>
            </div>
        </div>
    );
};

export default StudyPostDetail;
