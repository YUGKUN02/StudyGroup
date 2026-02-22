import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createStudyPost } from '../api/studyPost';
import '../css/CreateStudyPost.css';

const CreateStudyPost = () => {
    const { studyId } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        postType: 'GENERAL'
    });

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            alert('제목을 입력해주세요.');
            return;
        }

        if (!formData.content.trim()) {
            alert('내용을 입력해주세요.');
            return;
        }

        try {
            setLoading(true);
            const created = await createStudyPost(studyId, formData);
            alert('게시글이 작성되었습니다.');
            navigate(`/studies/${studyId}/posts/${created.id}`);
        } catch (err) {
            setError(err.response?.data?.message || '게시글 작성에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-study-post-container">
            <h2>게시글 작성</h2>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="post-form">
                <div className="form-group">
                    <label htmlFor="postType">게시글 유형</label>
                    <select
                        id="postType"
                        name="postType"
                        value={formData.postType}
                        onChange={handleChange}
                    >
                        <option value="GENERAL">일반</option>
                        <option value="NOTICE">공지</option>
                        <option value="DISCUSSION">토론</option>
                        <option value="ASSIGNMENT">과제</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="title">제목</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="제목을 입력하세요"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="content">내용</label>
                    <textarea
                        id="content"
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        placeholder="내용을 입력하세요"
                        rows="15"
                    />
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        onClick={() => navigate(`/studies/${studyId}/board`)}
                        className="btn-cancel"
                    >
                        취소
                    </button>
                    <button type="submit" disabled={loading} className="btn-submit">
                        {loading ? '작성 중...' : '작성하기'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateStudyPost;
