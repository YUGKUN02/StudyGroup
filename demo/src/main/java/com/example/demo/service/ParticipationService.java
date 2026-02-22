package com.example.demo.service;

import com.example.demo.dto.ParticipationRequestDTO;
import com.example.demo.dto.ParticipationResponseDTO;
import com.example.demo.dto.ParticipationUpdateDTO;
import com.example.demo.entity.Participation;
import com.example.demo.entity.Participation.ParticipationStatus;
import com.example.demo.entity.Study;
import com.example.demo.entity.User;
import com.example.demo.repository.ParticipationRepository;
import com.example.demo.repository.StudyRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ParticipationService {

    private final ParticipationRepository participationRepository;
    private final StudyRepository studyRepository;
    private final UserRepository userRepository;

    // 참여 신청 생성
    @Transactional
    public ParticipationResponseDTO createParticipation(Integer studyId, ParticipationRequestDTO dto, String email) {
        // 스터디 존재 확인
        Study study = studyRepository.findById(studyId.longValue())
                .orElseThrow(() -> new RuntimeException("스터디를 찾을 수 없습니다."));

        // 사용자 확인
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 자신의 스터디에는 참여 신청 불가
        if (study.getAuthorId().equals(user.getId())) {
            throw new RuntimeException("자신의 스터디에는 참여 신청할 수 없습니다.");
        }

        // 중복 신청 확인
        if (participationRepository.existsByStudyIdAndUserId(studyId, user.getId().intValue())) {
            throw new RuntimeException("이미 참여 신청한 스터디입니다.");
        }

        // 참여 신청 생성
        Participation participation = Participation.builder()
                .studyId(studyId)
                .userId(user.getId().intValue())
                .status(ParticipationStatus.PENDING)
                .message(dto.getMessage())
                .build();

        Participation savedParticipation = participationRepository.save(participation);

        return ParticipationResponseDTO.builder()
                .id(savedParticipation.getId())
                .studyId(savedParticipation.getStudyId())
                .userId(savedParticipation.getUserId())
                .userName(user.getName())
                .studyTitle(study.getTitle())
                .status(savedParticipation.getStatus())
                .message(savedParticipation.getMessage())
                .createdAt(savedParticipation.getCreatedAt())
                .updatedAt(savedParticipation.getUpdatedAt())
                .build();
    }

    // 특정 스터디의 참여 신청 목록 조회 (스터디 작성자만)
    @Transactional(readOnly = true)
    public List<ParticipationResponseDTO> getParticipationsByStudyId(Integer studyId, String email) {
        // 스터디 존재 확인
        Study study = studyRepository.findById(studyId.longValue())
                .orElseThrow(() -> new RuntimeException("스터디를 찾을 수 없습니다."));

        // 사용자 확인
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 스터디 작성자 확인
        if (!study.getAuthorId().equals(user.getId())) {
            throw new RuntimeException("조회 권한이 없습니다.");
        }

        List<Object[]> results = participationRepository.findByStudyIdWithUser(studyId);
        List<ParticipationResponseDTO> participations = new ArrayList<>();

        for (Object[] row : results) {
            ParticipationResponseDTO dto = ParticipationResponseDTO.builder()
                    .id(((Number) row[0]).intValue())
                    .studyId(((Number) row[1]).intValue())
                    .userId(((Number) row[2]).intValue())
                    .status(ParticipationStatus.valueOf((String) row[3]))
                    .message((String) row[4])
                    .createdAt(((Timestamp) row[5]).toLocalDateTime())
                    .updatedAt(((Timestamp) row[6]).toLocalDateTime())
                    .userName((String) row[7]) // user_name from join
                    .studyTitle(study.getTitle())
                    .build();
            participations.add(dto);
        }

        return participations;
    }

    // 내가 신청한 참여 목록 조회
    @Transactional(readOnly = true)
    public List<ParticipationResponseDTO> getMyParticipations(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        List<Object[]> results = participationRepository.findByUserIdWithStudy(user.getId().intValue());
        List<ParticipationResponseDTO> participations = new ArrayList<>();

        for (Object[] row : results) {
            ParticipationResponseDTO dto = ParticipationResponseDTO.builder()
                    .id(((Number) row[0]).intValue())
                    .studyId(((Number) row[1]).intValue())
                    .userId(((Number) row[2]).intValue())
                    .status(ParticipationStatus.valueOf((String) row[3]))
                    .message((String) row[4])
                    .createdAt(((Timestamp) row[5]).toLocalDateTime())
                    .updatedAt(((Timestamp) row[6]).toLocalDateTime())
                    .studyTitle((String) row[7]) // study_title from join
                    .userName(user.getName())
                    .build();
            participations.add(dto);
        }

        return participations;
    }

    // 참여 신청 승인/거절 (스터디 작성자만)
    @Transactional
    public ParticipationResponseDTO updateParticipationStatus(Integer studyId, Integer participationId,
                                                              ParticipationUpdateDTO dto, String email) {
        // 참여 신청 확인
        Participation participation = participationRepository.findById(participationId)
                .orElseThrow(() -> new RuntimeException("참여 신청을 찾을 수 없습니다."));

        // 스터디 확인
        Study study = studyRepository.findById(studyId.longValue())
                .orElseThrow(() -> new RuntimeException("스터디를 찾을 수 없습니다."));

        // 사용자 확인
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 스터디 작성자 확인
        if (!study.getAuthorId().equals(user.getId())) {
            throw new RuntimeException("수정 권한이 없습니다.");
        }

        // 참여 신청이 해당 스터디의 것인지 확인
        if (!participation.getStudyId().equals(studyId)) {
            throw new RuntimeException("잘못된 요청입니다.");
        }

        // 상태 업데이트
        participation.setStatus(dto.getStatus());
        Participation updatedParticipation = participationRepository.save(participation);

        // 신청자 정보 조회
        User applicant = userRepository.findById(participation.getUserId().longValue())
                .orElseThrow(() -> new RuntimeException("신청자를 찾을 수 없습니다."));

        return ParticipationResponseDTO.builder()
                .id(updatedParticipation.getId())
                .studyId(updatedParticipation.getStudyId())
                .userId(updatedParticipation.getUserId())
                .userName(applicant.getName())
                .studyTitle(study.getTitle())
                .status(updatedParticipation.getStatus())
                .message(updatedParticipation.getMessage())
                .createdAt(updatedParticipation.getCreatedAt())
                .updatedAt(updatedParticipation.getUpdatedAt())
                .build();
    }

    // 참여 신청 취소 (신청자 본인만)
    @Transactional
    public void deleteParticipation(Integer studyId, Integer participationId, String email) {
        // 참여 신청 확인
        Participation participation = participationRepository.findById(participationId)
                .orElseThrow(() -> new RuntimeException("참여 신청을 찾을 수 없습니다."));

        // 사용자 확인
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 신청자 본인 확인
        if (!participation.getUserId().equals(user.getId())) {
            throw new RuntimeException("삭제 권한이 없습니다.");
        }

        // 참여 신청이 해당 스터디의 것인지 확인
        if (!participation.getStudyId().equals(studyId)) {
            throw new RuntimeException("잘못된 요청입니다.");
        }

        participationRepository.delete(participation);
    }
}
