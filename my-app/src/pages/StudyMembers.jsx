import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getStudyMembers, updateMemberRole, kickMember, leaveStudy } from '../api/studyMember';
import '../css/StudyMembers.css';

const StudyMembers = () => {
    const { studyId } = useParams();
    const navigate = useNavigate();
    const currentUser = useSelector((state) => state.user.user);

    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLeader, setIsLeader] = useState(false);

    useEffect(() => {
        fetchMembers();
    }, [studyId]);

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const data = await getStudyMembers(studyId);
            setMembers(data);

            // 현재 사용자가 스터디장인지 확인
            const leader = data.find(m => m.role === 'LEADER');
            setIsLeader(leader && leader.userId === currentUser?.id);

            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || '멤버 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (participationId, newRole) => {
        if (!window.confirm(`역할을 ${getRoleLabel(newRole)}(으)로 변경하시겠습니까?`)) {
            return;
        }

        try {
            await updateMemberRole(studyId, participationId, newRole);
            alert('역할이 변경되었습니다.');
            fetchMembers();
        } catch (err) {
            alert(err.response?.data?.message || '역할 변경에 실패했습니다.');
        }
    };

    const handleKick = async (participationId, userName) => {
        if (!window.confirm(`${userName}님을 정말 강퇴하시겠습니까?`)) {
            return;
        }

        try {
            await kickMember(studyId, participationId);
            alert('멤버가 강퇴되었습니다.');
            fetchMembers();
        } catch (err) {
            alert(err.response?.data?.message || '강퇴에 실패했습니다.');
        }
    };

    const handleLeave = async () => {
        if (!window.confirm('정말 스터디를 나가시겠습니까?')) {
            return;
        }

        try {
            await leaveStudy(studyId);
            alert('스터디를 나갔습니다.');
            navigate('/studies');
        } catch (err) {
            alert(err.response?.data?.message || '스터디 나가기에 실패했습니다.');
        }
    };

    const getRoleLabel = (role) => {
        switch (role) {
            case 'LEADER': return '스터디장';
            case 'SUB_LEADER': return '부스터디장';
            case 'MEMBER': return '멤버';
            default: return role;
        }
    };

    const getRoleBadgeClass = (role) => {
        switch (role) {
            case 'LEADER': return 'badge-leader';
            case 'SUB_LEADER': return 'badge-sub-leader';
            case 'MEMBER': return 'badge-member';
            default: return '';
        }
    };

    if (loading) return <div className="loading">로딩 중...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="study-members-container">
            <div className="members-header">
                <h2>스터디 멤버 ({members.length}명)</h2>
                <div className="header-buttons">
                    <button onClick={() => navigate(`/studies/${studyId}`)} className="btn-back">
                        스터디로 돌아가기
                    </button>
                    {!isLeader && (
                        <button onClick={handleLeave} className="btn-leave">
                            스터디 나가기
                        </button>
                    )}
                </div>
            </div>

            <div className="members-list">
                {members.map((member) => (
                    <div key={member.userId} className="member-card">
                        <div className="member-info">
                            <div className="member-main">
                                <h3>{member.userName}</h3>
                                <span className={`role-badge ${getRoleBadgeClass(member.role)}`}>
                                    {getRoleLabel(member.role)}
                                </span>
                            </div>
                            <p className="member-email">{member.userEmail}</p>
                            <p className="member-joined">
                                가입일: {new Date(member.joinedAt).toLocaleDateString()}
                            </p>
                        </div>

                        {isLeader && member.role !== 'LEADER' && (
                            <div className="member-actions">
                                <select
                                    value={member.role}
                                    onChange={(e) => handleRoleChange(member.id, e.target.value)}
                                    className="role-select"
                                >
                                    <option value="MEMBER">멤버</option>
                                    <option value="SUB_LEADER">부스터디장</option>
                                </select>
                                <button
                                    onClick={() => handleKick(member.id, member.userName)}
                                    className="btn-kick"
                                >
                                    강퇴
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudyMembers;
