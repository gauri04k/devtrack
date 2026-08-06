package com.devtrack.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devtrack.dto.request.SkillRequest;
import com.devtrack.dto.response.SkillResponse;
import com.devtrack.entity.Skill;
import com.devtrack.entity.User;
import com.devtrack.enums.SkillStatus;
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

    public SkillServiceImpl(SkillRepository skillRepository,
                            UserRepository userRepository) {
        this.skillRepository = skillRepository;
        this.userRepository = userRepository;
    }

    @Override
    public SkillResponse createSkill(Long userId, SkillRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found with id : " + userId));

        if (skillRepository.existsByNameIgnoreCaseAndUser(request.getName(), user)) {
            throw new RuntimeException("Skill already exists");
        }

        Skill skill = SkillMapper.toEntity(request);

        skill.setUser(user);

        Skill savedSkill = skillRepository.save(skill);

        return SkillMapper.toResponse(savedSkill);
    }

    @Override
    public List<SkillResponse> getAllSkills(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found with id : " + userId));

        return skillRepository.findByUser(user)
                .stream()
                .map(SkillMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public SkillResponse getSkillById(Long userId, Long skillId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found with id : " + userId));

        Skill skill = skillRepository.findByIdAndUser(skillId, user)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Skill not found with id : " + skillId));

        return SkillMapper.toResponse(skill);
    }

    @Override
    public SkillResponse updateSkill(Long userId,
                                     Long skillId,
                                     SkillRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found with id : " + userId));

        Skill skill = skillRepository.findByIdAndUser(skillId, user)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Skill not found with id : " + skillId));

        if (!skill.getName().equalsIgnoreCase(request.getName())
                && skillRepository.existsByNameIgnoreCaseAndUser(request.getName(), user)) {

            throw new RuntimeException("Skill already exists");
        }

        skill.setName(request.getName());
        skill.setStatus(request.getStatus());
        skill.setTargetDate(request.getTargetDate());

        Skill updatedSkill = skillRepository.save(skill);

        return SkillMapper.toResponse(updatedSkill);
    }

    @Override
    public void deleteSkill(Long userId, Long skillId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found with id : " + userId));

        Skill skill = skillRepository.findByIdAndUser(skillId, user)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Skill not found with id : " + skillId));

        skillRepository.delete(skill);
    }

    @Override
    public List<SkillResponse> getSkillsByStatus(Long userId,
                                                 SkillStatus status) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found with id : " + userId));

        return skillRepository.findByUserAndStatus(user, status)
                .stream()
                .map(SkillMapper::toResponse)
                .collect(Collectors.toList());
    }

}