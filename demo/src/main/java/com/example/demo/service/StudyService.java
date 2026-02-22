package com.example.demo.service;

import com.example.demo.dto.StudyRequestDTO;
import com.example.demo.dto.StudyResponseDTO;
import com.example.demo.entity.Study;
import com.example.demo.entity.User;
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
public class StudyService {

    private final StudyRepository studyRepository;
    private final UserRepository userRepository;

    // ========= 스터디 생성 =========
    @Transactional
    public StudyResponseDTO createStudy(StudyRequestDTO dto, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        Study study = Study.builder()
                .authorId(user.getId())
                .title(dto.getTitle())
                .description(dto.getDescription())
                .status(dto.getStatus())
                .category(dto.getCategory())
                .schedule(dto.getSchedule())
                .location(dto.getLocation())
                .recruitCount(dto.getRecruitCount())
                .curriculum(dto.getCurriculum())
                .isTemp(false)
                .views(0)
                .build();

        Study saved = studyRepository.save(study);

        return toDTO(saved, user.getName());
    }


    // ========= 스터디 목록 조회 =========
    @Transactional(readOnly = true)
    public List<StudyResponseDTO> getAllStudies() {

        List<Object[]> rows = studyRepository.findAllWithAuthor();
        List<StudyResponseDTO> list = new ArrayList<>();

        for (Object[] row : rows) {
            // row 인덱스: id(0), author_id(1), title(2), description(3),
            // status(4), category(5), schedule(6), location(7),
            // recruit_count(8), curriculum(9), views(10), is_temp(11),
            // created_at(12), updated_at(13), author_name(14)

            StudyResponseDTO dto = StudyResponseDTO.builder()
                    .id(((Number) row[0]).longValue())
                    .title((String) row[2])
                    .description((String) row[3])
                    .status((String) row[4])
                    .category((String) row[5])
                    .schedule((String) row[6])
                    .location((String) row[7])
                    .recruitCount(row[8] != null ? ((Number) row[8]).intValue() : null)
                    .curriculum((String) row[9])
                    .views(row[10] != null ? ((Number) row[10]).intValue() : 0)
                    .isTemp(row[11] != null ? (Boolean) row[11] : false)
                    .createdAt(((Timestamp) row[12]).toLocalDateTime())
                    .updatedAt(((Timestamp) row[13]).toLocalDateTime())
                    .author((String) row[14])
                    .build();

            list.add(dto);
        }

        return list;
    }


    // ========= 스터디 상세 =========
    @Transactional
    public StudyResponseDTO getStudyById(Long id) {

        Study study = studyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("스터디를 찾을 수 없습니다."));

        study.setViews(study.getViews() + 1);
        studyRepository.save(study);

        User author = userRepository.findById(study.getAuthorId())
                .orElseThrow(() -> new RuntimeException("작성자를 찾을 수 없습니다."));

        return toDTO(study, author.getName());
    }


    // ========= 스터디 수정 =========
    @Transactional
    public StudyResponseDTO updateStudy(Long id, StudyRequestDTO dto, String email) {

        Study study = studyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("스터디를 찾을 수 없습니다."));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        if (!study.getAuthorId().equals(user.getId())) {
            throw new RuntimeException("수정 권한이 없습니다.");
        }

        study.setTitle(dto.getTitle());
        study.setDescription(dto.getDescription());
        study.setStatus(dto.getStatus());
        study.setCategory(dto.getCategory());
        study.setSchedule(dto.getSchedule());
        study.setLocation(dto.getLocation());
        study.setRecruitCount(dto.getRecruitCount());
        study.setCurriculum(dto.getCurriculum());

        Study updated = studyRepository.save(study);

        return toDTO(updated, user.getName());
    }


    // ========= 스터디 삭제 =========
    @Transactional
    public void deleteStudy(Long id, String email) {

        Study study = studyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("스터디를 찾을 수 없습니다."));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        if (!study.getAuthorId().equals(user.getId())) {
            throw new RuntimeException("삭제 권한이 없습니다.");
        }

        studyRepository.delete(study);
    }


    // ========= 내가 작성한 게시글 =========
    @Transactional(readOnly = true)
    public List<StudyResponseDTO> getMyPosts(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        List<Object[]> rows = studyRepository.findByAuthorIdWithAuthor(user.getId());
        List<StudyResponseDTO> list = new ArrayList<>();

        for (Object[] row : rows) {
            // row 인덱스: id(0), author_id(1), title(2), description(3),
            // status(4), category(5), schedule(6), location(7),
            // recruit_count(8), curriculum(9), views(10), is_temp(11),
            // created_at(12), updated_at(13), author_name(14)

            StudyResponseDTO dto = StudyResponseDTO.builder()
                    .id(((Number) row[0]).longValue())
                    .title((String) row[2])
                    .description((String) row[3])
                    .status((String) row[4])
                    .category((String) row[5])
                    .schedule((String) row[6])
                    .location((String) row[7])
                    .recruitCount(row[8] != null ? ((Number) row[8]).intValue() : null)
                    .curriculum((String) row[9])
                    .views(row[10] != null ? ((Number) row[10]).intValue() : 0)
                    .isTemp(row[11] != null ? (Boolean) row[11] : false)
                    .createdAt(((Timestamp) row[12]).toLocalDateTime())
                    .updatedAt(((Timestamp) row[13]).toLocalDateTime())
                    .author((String) row[14])
                    .build();

            list.add(dto);
        }

        return list;
    }


    // ========= 임시저장 =========
    @Transactional
    public StudyResponseDTO saveTempStudy(StudyRequestDTO dto, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        Study study = Study.builder()
                .authorId(user.getId())
                .title(dto.getTitle())
                .description(dto.getDescription())
                .status(dto.getStatus())
                .category(dto.getCategory())
                .schedule(dto.getSchedule())
                .location(dto.getLocation())
                .recruitCount(dto.getRecruitCount())
                .curriculum(dto.getCurriculum())
                .isTemp(true)
                .views(0)
                .build();

        Study saved = studyRepository.save(study);

        return toDTO(saved, user.getName());
    }


    // ========= 최신 임시저장 =========
    @Transactional(readOnly = true)
    public StudyResponseDTO getLatestTempStudy(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        Study latest = studyRepository.findLatestTempByAuthor(user.getId());

        if (latest == null) return null;

        return toDTO(latest, user.getName());
    }


    // ========= Entity → DTO 변환 메서드 =========
    private StudyResponseDTO toDTO(Study s, String authorName) {

        return StudyResponseDTO.builder()
                .id(s.getId())
                .title(s.getTitle())
                .description(s.getDescription())
                .status(s.getStatus())
                .category(s.getCategory())
                .schedule(s.getSchedule())
                .location(s.getLocation())
                .recruitCount(s.getRecruitCount())
                .curriculum(s.getCurriculum())
                .isTemp(s.getIsTemp())
                .author(authorName)
                .views(s.getViews())
                .createdAt(s.getCreatedAt())
                .updatedAt(s.getUpdatedAt())
                .build();
    }
}