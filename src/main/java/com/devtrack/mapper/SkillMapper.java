package com.devtrack.mapper;

import com.devtrack.dto.request.SkillRequest;
import com.devtrack.dto.response.SkillResponse;
import com.devtrack.entity.Skill;

public final class SkillMapper {

    private SkillMapper() {
    }

    public static Skill toEntity(SkillRequest request) {

        if (request == null) {
            return null;
        }

        return Skill.builder()
                .name(request.getName().trim())
                .status(request.getStatus())
                .targetDate(request.getTargetDate())
                .build();
    }

    public static SkillResponse toResponse(Skill skill) {

        if (skill == null) {
            return null;
        }

        return SkillResponse.builder()
                .id(skill.getId())
                .name(skill.getName())
                .status(skill.getStatus())
                .targetDate(skill.getTargetDate())
                .build();
    }
}