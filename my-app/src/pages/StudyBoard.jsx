import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStudyPosts } from '../api/studyPost';
import '../css/StudyBoard.css';

const StudyBoard = () => {
    const { studyId } = useParams();
    const navigate = useNavigate();

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterType, setFilterType] = useState('ALL');

    useEffect(() => {
        fetchPosts();
    }, [studyId]);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const data = await getStudyPosts(studyId);
            setPosts(data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || '게시글을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
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

    const filteredPosts = filterType === 'ALL'
        ? posts
        : posts.filter(post => post.postType === filterType);

    if (loading) return <div className="loading">로딩 중...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="study-board-container">
            <div className="board-header">
                <h2>스터디 게시판</h2>
                <div className="header-buttons">
                    <button onClick={() => navigate(`/studies/${studyId}`)} className="btn-back">
                        스터디로 돌아가기
                    </button>
                    <button onClick={() => navigate(`/studies/${studyId}/posts/create`)} className="btn-create">
                        글쓰기
                    </button>
                </div>
            </div>

            <div className="board-filter">
                <button
                    className={filterType === 'ALL' ? 'active' : ''}
                    onClick={() => setFilterType('ALL')}
                >
                    전체
                </button>
                <button
                    className={filterType === 'NOTICE' ? 'active' : ''}
                    onClick={() => setFilterType('NOTICE')}
                >
                    공지
                </button>
                <button
                    className={filterType === 'DISCUSSION' ? 'active' : ''}
                    onClick={() => setFilterType('DISCUSSION')}
                >
                    토론
                </button>
                <button
                    className={filterType === 'ASSIGNMENT' ? 'active' : ''}
                    onClick={() => setFilterType('ASSIGNMENT')}
                >
                    과제
                </button>
                <button
                    className={filterType === 'GENERAL' ? 'active' : ''}
                    onClick={() => setFilterType('GENERAL')}
                >
                    일반
                </button>
            </div>

            <div className="posts-list">
                {filteredPosts.length === 0 ? (
                    <div className="empty-message">게시글이 없습니다.</div>
                ) : (
                    filteredPosts.map((post) => (
                        <div
                            key={post.id}
                            className="post-card"
                            onClick={() => navigate(`/studies/${studyId}/posts/${post.id}`)}
                        >
                            <div className="post-header">
                                <span className={`post-type-badge ${getPostTypeBadgeClass(post.postType)}`}>
                                    {getPostTypeLabel(post.postType)}
                                </span>
                                <h3>{post.title}</h3>
                            </div>
                            <div className="post-content-preview">
                                {post.content.substring(0, 100)}
                                {post.content.length > 100 && '...'}
                            </div>
                            <div className="post-meta">
                                <span className="post-author">{post.authorName}</span>
                                <span className="post-date">
                                    {new Date(post.createdAt).toLocaleDateString()}
                                </span>
                                <span className="post-views">조회 {post.views}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default StudyBoard;
