package com.devtrack.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.devtrack.entity.Project;
import com.devtrack.entity.User;
import com.devtrack.enums.ProjectStatus;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByUser(User user);

    List<Project> findByUserAndStatus(User user, ProjectStatus status);

    Optional<Project> findByIdAndUser(Long id, User user);

    boolean existsByTitleIgnoreCaseAndUser(String title, User user);

}