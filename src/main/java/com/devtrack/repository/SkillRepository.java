package com.devtrack.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.devtrack.entity.Skill;
import com.devtrack.entity.User;
import com.devtrack.enums.SkillStatus;

@Repository
public interface SkillRepository extends JpaRepository<Skill, Long> {

    List<Skill> findByUser(User user);

    List<Skill> findByUserAndStatus(User user, SkillStatus status);

    Optional<Skill> findByIdAndUser(Long id, User user);

    boolean existsByIdAndUser(Long id, User user);

    boolean existsByNameIgnoreCaseAndUser(String name, User user);

}