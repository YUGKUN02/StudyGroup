package com.example.demo.service;

import com.example.demo.dto.CommentRequestDTO;
import com.example.demo.dto.CommentResponseDTO;
import com.example.demo.entity.Comment;
import com.example.demo.entity.Study;
import com.example.demo.entity.User;
import com.example.demo.repository.CommentRepository;
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
public class CommentService {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final StudyRepository studyRepository;

    // 댓글 작성 (원댓글 또는 대댓글)
    @Transactional
    public CommentResponseDTO createComment(Long studyId, CommentRequestDTO dto, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 대댓글인 경우 부모 댓글 존재 여부 확인
        if (dto.getParentId() != null) {
            Comment parentComment = commentRepository.findById(dto.getParentId())
                    .orElseThrow(() -> new RuntimeException("부모 댓글을 찾을 수 없습니다."));

            // 부모 댓글이 같은 스터디에 속하는지 확인
            if (!parentComment.getStudyId().equals(studyId)) {
                throw new RuntimeException("부모 댓글이 해당 스터디에 속하지 않습니다.");
            }
        }

        Comment comment = Comment.builder()
                .studyId(studyId)
                .authorId(user.getId())
                .parentId(dto.getParentId())
                .content(dto.getContent())
                .build();

        Comment savedComment = commentRepository.save(comment);

        return CommentResponseDTO.builder()
                .id(savedComment.getId())
                .studyId(savedComment.getStudyId())
                .parentId(savedComment.getParentId())
                .content(savedComment.getContent())
                .author(user.getName())
                .createdAt(savedComment.getCreatedAt())
                .updatedAt(savedComment.getUpdatedAt())
                .build();
    }

    // 특정 스터디의 댓글 목록 조회 (작성자 이름 포함, 계층 구조)
    @Transactional(readOnly = true)
    public List<CommentResponseDTO> getCommentsByStudyId(Long studyId) {
        List<Object[]> results = commentRepository.findByStudyIdWithAuthor(studyId);
        List<CommentResponseDTO> allComments = new ArrayList<>();
        List<CommentResponseDTO> parentComments = new ArrayList<>();

        // 1단계: 모든 댓글을 DTO로 변환
        for (Object[] row : results) {
            Long parentId = row[3] != null ? ((Number) row[3]).longValue() : null;

            CommentResponseDTO dto = CommentResponseDTO.builder()
                    .id(((Number) row[0]).longValue())
                    .studyId(((Number) row[1]).longValue())
                    .parentId(parentId)
                    .content((String) row[4])
                    .author((String) row[7])
                    .createdAt(((Timestamp) row[5]).toLocalDateTime())
                    .updatedAt(((Timestamp) row[6]).toLocalDateTime())
                    .build();
            allComments.add(dto);
        }

        // 2단계: 원댓글과 대댓글을 분리하고 계층 구조 생성
        for (CommentResponseDTO comment : allComments) {
            if (comment.getParentId() == null) {
                // 원댓글
                parentComments.add(comment);
            } else {
                // 대댓글: 부모 댓글 찾아서 replies에 추가
                for (CommentResponseDTO parent : allComments) {
                    if (parent.getId().equals(comment.getParentId())) {
                        parent.getReplies().add(comment);
                        break;
                    }
                }
            }
        }

        return parentComments;
    }

    // 댓글 수정
    @Transactional
    public CommentResponseDTO updateComment(Long commentId, CommentRequestDTO dto, String email) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다."));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 작성자 확인
        if (!comment.getAuthorId().equals(user.getId())) {
            throw new RuntimeException("수정 권한이 없습니다.");
        }

        comment.setContent(dto.getContent());
        Comment updatedComment = commentRepository.save(comment);

        return CommentResponseDTO.builder()
                .id(updatedComment.getId())
                .studyId(updatedComment.getStudyId())
                .parentId(updatedComment.getParentId())
                .content(updatedComment.getContent())
                .author(user.getName())
                .createdAt(updatedComment.getCreatedAt())
                .updatedAt(updatedComment.getUpdatedAt())
                .build();
    }

    // 댓글 삭제
    @Transactional
    public void deleteComment(Long commentId, String email) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다."));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 게시글 정보 조회
        Study study = studyRepository.findById(comment.getStudyId())
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));

        // 권한 확인: 댓글 작성자 OR 게시글 작성자
        boolean isCommentAuthor = comment.getAuthorId().equals(user.getId());
        boolean isStudyAuthor = study.getAuthorId().equals(user.getId());

        if (!isCommentAuthor && !isStudyAuthor) {
            throw new RuntimeException("삭제 권한이 없습니다.");
        }

        commentRepository.delete(comment);
    }
}
