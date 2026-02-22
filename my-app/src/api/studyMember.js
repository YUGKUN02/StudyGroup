import axiosInstance from './axiosInstance';

// 스터디 멤버 목록 조회
export const getStudyMembers = async (studyId) => {
    const response = await axiosInstance.get(`/api/studies/${studyId}/members`);
    return response.data;
};

// 멤버 역할 변경 (스터디장만)
export const updateMemberRole = async (studyId, participationId, role) => {
    const response = await axiosInstance.put(
        `/api/studies/${studyId}/members/${participationId}/role`,
        { role }
    );
    return response.data;
};

// 멤버 강퇴 (스터디장만)
export const kickMember = async (studyId, participationId) => {
    await axiosInstance.delete(`/api/studies/${studyId}/members/${participationId}`);
};

// 스터디 나가기 (본인)
export const leaveStudy = async (studyId) => {
    await axiosInstance.delete(`/api/studies/${studyId}/members/leave`);
};
