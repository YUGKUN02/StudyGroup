package com.example.demo.repository;

import com.example.demo.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    // 특정 스터디의 댓글을 작성자 이름과 함께 조회 (Native Query)
    // parent_id 포함하여 계층 구조 유지
    @Query(value = "SELECT c.*, u.name as author_name FROM comment c " +
                   "LEFT JOIN user u ON c.author_id = u.id " +
                   "WHERE c.study_id = ?1 " +
                   "ORDER BY COALESCE(c.parent_id, c.id), c.parent_id IS NULL DESC, c.created_at ASC",
                   nativeQuery = true)
    List<Object[]> findByStudyIdWithAuthor(Long studyId);
}
