package com.example.demo.repository;

import com.example.demo.entity.Study;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudyRepository extends JpaRepository<Study, Long> {

    // 전체 스터디 + 작성자 이름 포함 조회
    @Query(value = "SELECT s.*, u.name AS author_name FROM study s " +
            "LEFT JOIN user u ON s.author_id = u.id " +
            "WHERE s.is_temp = false " +
            "ORDER BY s.created_at DESC",
            nativeQuery = true)
    List<Object[]> findAllWithAuthor();

    // 특정 작성자 스터디 + 작성자 이름 포함 조회
    @Query(value = "SELECT s.*, u.name AS author_name FROM study s " +
            "LEFT JOIN user u ON s.author_id = u.id " +
            "WHERE s.author_id = :authorId AND s.is_temp = false " +
            "ORDER BY s.created_at DESC",
            nativeQuery = true)
    List<Object[]> findByAuthorIdWithAuthor(Long authorId);

    // ⭐ 최신 임시저장 1개 가져오기
    @Query(value = "SELECT * FROM study " +
            "WHERE author_id = :authorId AND is_temp = true " +
            "ORDER BY created_at DESC LIMIT 1",
            nativeQuery = true)
    Study findLatestTempByAuthor(Long authorId);
}