import axiosInstance from './axiosInstance';

// 스터디 게시글 목록 조회
export const getStudyPosts = async (studyId) => {
    const response = await axiosInstance.get(`/api/studies/${studyId}/posts`);
    return response.data;
};

// 스터디 게시글 상세 조회
export const getStudyPost = async (studyId, postId) => {
    const response = await axiosInstance.get(`/api/studies/${studyId}/posts/${postId}`);
    return response.data;
};

// 스터디 게시글 작성
export const createStudyPost = async (studyId, postData) => {
    const response = await axiosInstance.post(`/api/studies/${studyId}/posts`, postData);
    return response.data;
};

// 스터디 게시글 수정
export const updateStudyPost = async (studyId, postId, postData) => {
    const response = await axiosInstance.put(`/api/studies/${studyId}/posts/${postId}`, postData);
    return response.data;
};

// 스터디 게시글 삭제
export const deleteStudyPost = async (studyId, postId) => {
    await axiosInstance.delete(`/api/studies/${studyId}/posts/${postId}`);
};

// 게시글 댓글 목록 조회
export const getPostComments = async (studyId, postId) => {
    const response = await axiosInstance.get(`/api/studies/${studyId}/posts/${postId}/comments`);
    return response.data;
};

// 게시글 댓글 작성
export const createPostComment = async (studyId, postId, commentData) => {
    const response = await axiosInstance.post(
        `/api/studies/${studyId}/posts/${postId}/comments`,
        commentData
    );
    return response.data;
};

// 게시글 댓글 삭제
export const deletePostComment = async (studyId, postId, commentId) => {
    await axiosInstance.delete(`/api/studies/${studyId}/posts/${postId}/comments/${commentId}`);
};
