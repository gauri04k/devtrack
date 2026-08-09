package com.devtrack.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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
    
          @Query("""
                SELECT COUNT(p)
                FROM Project p
                WHERE p.user.id = :userId
                AND p.status = com.devtrack.enums.ProjectStatus.ACTIVE
             """)
    
       long countActiveProjectsByUserId(@Param("userId") Long userId);

}