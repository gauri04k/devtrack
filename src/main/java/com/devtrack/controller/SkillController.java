package com.devtrack.controller;

import java.util.List;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.devtrack.dto.request.SkillRequest;
import com.devtrack.dto.response.SkillResponse;
import com.devtrack.enums.SkillStatus;
import com.devtrack.service.SkillService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users/{userId}/skills")
@Validated
public class SkillController {

    private final SkillService skillService;

    public SkillController(SkillService skillService) {
        this.skillService = skillService;
    }

    // Create Skill
    @PostMapping
    public SkillResponse createSkill(@PathVariable Long userId,@Valid @RequestBody SkillRequest request) {
        return skillService.createSkill(userId, request);
    }

    // Get All Skills
    @GetMapping
    public List<SkillResponse> getAllSkills(@PathVariable Long userId) {
        return skillService.getAllSkills(userId);
    }

    // Get Skill By Id
    @GetMapping("/{skillId}")
    public SkillResponse getSkillById( @PathVariable Long userId,@PathVariable Long skillId) {
        return skillService.getSkillById(userId, skillId);
    }

    // Update Skill
    @PutMapping("/{skillId}")
    public SkillResponse updateSkill(@PathVariable Long userId, @PathVariable Long skillId, @Valid @RequestBody SkillRequest request){
        return skillService.updateSkill(userId, skillId, request);
    }

    // Delete Skill
    @DeleteMapping("/{skillId}")
    public String deleteSkill(@PathVariable Long userId,@PathVariable Long skillId) {
        skillService.deleteSkill(userId, skillId);
        return "Skill deleted successfully";
    }

    // Filter Skills by Status
    @GetMapping("/status/{status}")
    public List<SkillResponse> getSkillsByStatus(@PathVariable Long userId,@PathVariable SkillStatus status) {
        return skillService.getSkillsByStatus(userId, status);
    }

}