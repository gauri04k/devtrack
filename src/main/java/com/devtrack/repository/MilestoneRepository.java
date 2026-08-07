package com.devtrack.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.devtrack.entity.Milestone;

public interface MilestoneRepository extends JpaRepository<Milestone, Long> {
    List<Milestone> findByProjectId(Long projectId);
}