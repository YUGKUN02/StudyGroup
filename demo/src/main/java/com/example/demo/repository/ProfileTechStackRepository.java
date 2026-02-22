package com.example.demo.repository;

import com.example.demo.entity.ProfileTechStack;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProfileTechStackRepository extends JpaRepository<ProfileTechStack, Long> {
    List<ProfileTechStack> findByProfileId(Long profileId);
    void deleteByProfileId(Long profileId);
}