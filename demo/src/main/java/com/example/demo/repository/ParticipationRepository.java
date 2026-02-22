package com.example.demo.repository;

import com.example.demo.entity.Participation;
import com.example.demo.entity.Participation.ParticipationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParticipationRepository extends JpaRepository<Participation, Integer> {

    // 특정 스터디의 모든 참여 신청 조회 (사용자 이름 포함)
    @Query(value = "SELECT p.*, u.name as user_name FROM participation p " +
                   "LEFT JOIN user u ON p.user_id = u.id " +
                   "WHERE p.study_id = :studyId " +
                   "ORDER BY p.created_at DESC", nativeQuery = true)
    List<Object[]> findByStudyIdWithUser(Integer studyId);

    // 특정 사용자의 모든 참여 신청 조회 (스터디 정보 포함)
    @Query(value = "SELECT p.*, s.title as study_title FROM participation p " +
                   "LEFT JOIN study s ON p.study_id = s.id " +
                   "WHERE p.user_id = :userId " +
                   "ORDER BY p.created_at DESC", nativeQuery = true)
    List<Object[]> findByUserIdWithStudy(Integer userId);

    // 특정 사용자가 특정 스터디에 이미 신청했는지 확인
    Optional<Participation> findByStudyIdAndUserId(Integer studyId, Integer userId);

    // 특정 스터디의 승인된 참여 목록
    List<Participation> findByStudyIdAndStatus(Integer studyId, ParticipationStatus status);

    // 중복 신청 방지: 이미 신청한 적이 있는지 확인
    boolean existsByStudyIdAndUserId(Integer studyId, Integer userId);
}
