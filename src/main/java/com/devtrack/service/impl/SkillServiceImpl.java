package com.devtrack.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devtrack.dto.request.SkillRequest;
import com.devtrack.dto.response.SkillResponse;
import com.devtrack.entity.Skill;
import com.devtrack.entity.User;
import com.devtrack.enums.SkillStatus;
import com.devtrack.exception.DuplicateSkillException;
import com.devtrack.exception.ResourceNotFoundException;
import com.devtrack.mapper.SkillMapper;
import com.devtrack.repository.SkillRepository;
import com.devtrack.repository.UserRepository;
import com.devtrack.service.SkillService;

@Service
@Transactional
public class SkillServiceImpl implements SkillService {

    private final SkillRepository skillRepository;

    private final UserRepository userRepository;

    public SkillServiceImpl(
            SkillRepository skillRepository,
            UserRepository userRepository
    ) {
        this.skillRepository = skillRepository;
        this.userRepository = userRepository;
    }

    @Override
    public SkillResponse createSkill(
            Long userId,
            SkillRequest request
    ) {

        User user = getUser(userId);

        String skillName =
                normalizeSkillName(request.getName());

        if (skillRepository
                .existsByNameIgnoreCaseAndUser(
                        skillName,
                        user
                )) {

            throw new DuplicateSkillException(
                    "Skill '" + skillName +
                    "' already exists for this user."
            );
        }

        Skill skill =
                SkillMapper.toEntity(request);

        skill.setName(skillName);

        skill.setUser(user);

        Skill savedSkill =
                skillRepository.save(skill);

        return SkillMapper.toResponse(savedSkill);
    }


    @Override
    @Transactional(readOnly = true)
    public List<SkillResponse> getAllSkills(
            Long userId
    ) {

        User user = getUser(userId);

        return skillRepository
                .findByUserOrderByIdDesc(user)
                .stream()
                .map(SkillMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public SkillResponse getSkillById(
            Long userId,
            Long skillId
    ) {

        User user = getUser(userId);

        Skill skill =
                skillRepository
                        .findByIdAndUser(
                                skillId,
                                user
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Skill not found with id: "
                                        + skillId
                                )
                        );

        return SkillMapper.toResponse(skill);
    }


    @Override
    public SkillResponse updateSkill(
            Long userId,
            Long skillId,
            SkillRequest request
    ) {

        User user = getUser(userId);

        Skill skill =
                skillRepository
                        .findByIdAndUser(
                                skillId,
                                user
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Skill not found with id: "
                                        + skillId
                                )
                        );

        String newName = normalizeSkillName(request.getName());


        if (!skill.getName()
                .equalsIgnoreCase(newName)) {

            boolean duplicate =
                    skillRepository
                            .existsByNameIgnoreCaseAndUser(
                                    newName,
                                    user
                            );

            if (duplicate) {

                throw new DuplicateSkillException(
                        "Another skill named '" +
                        newName +
                        "' already exists for this user."
                );
            }
        }


        skill.setName(newName);

        skill.setStatus(
                request.getStatus()
        );

        skill.setTargetDate(
                request.getTargetDate()
        );

        Skill updatedSkill =
                skillRepository.save(skill);

        return SkillMapper.toResponse(
                updatedSkill
        );
    }


    @Override
    public void deleteSkill(
            Long userId,
            Long skillId
    ) {

        User user = getUser(userId);

        Skill skill =
                skillRepository
                        .findByIdAndUser(
                                skillId,
                                user
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Skill not found with id: "
                                        + skillId
                                )
                        );

        skillRepository.delete(skill);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SkillResponse> getSkillsByStatus(
            Long userId,
            SkillStatus status
    ) {

        User user = getUser(userId);

        return skillRepository
                .findByUserAndStatusOrderByIdDesc(
                        user,
                        status
                )
                .stream()
                .map(SkillMapper::toResponse)
                .toList();
    }


    private User getUser(Long userId) {

        return userRepository
                .findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with id: "
                                + userId
                        )
                );
    }

    private String normalizeSkillName(
            String name
    ) {

        if (name == null) {
            return null;
        }

        return name
                .trim()
                .replaceAll("\\s+", " ");
    }
}