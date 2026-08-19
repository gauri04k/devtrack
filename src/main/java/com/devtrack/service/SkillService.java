package com.devtrack.service;

import java.util.List;

import com.devtrack.dto.request.SkillRequest;
import com.devtrack.dto.response.SkillResponse;
import com.devtrack.enums.SkillStatus;

public interface SkillService {

    SkillResponse createSkill(Long userId,SkillRequest request);

    List<SkillResponse> getAllSkills(Long userId);

    SkillResponse getSkillById(Long userId,Long skillId);

    SkillResponse updateSkill(Long userId,Long skillId,SkillRequest request);

    void deleteSkill(Long userId,Long skillId);

    List<SkillResponse> getSkillsByStatus(Long userId,SkillStatus status);
}