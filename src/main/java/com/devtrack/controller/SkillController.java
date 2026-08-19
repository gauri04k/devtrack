package com.devtrack.controller;

import java.util.List;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.devtrack.dto.request.SkillRequest;
import com.devtrack.dto.response.SkillResponse;
import com.devtrack.enums.SkillStatus;
import com.devtrack.service.SkillService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users/{userId}/skills")
@Validated
@Tag(name = "Skills",description = "Skill tracking endpoints")
public class SkillController {

    private final SkillService skillService;

    public SkillController(SkillService skillService) {
        this.skillService = skillService;
    }

    @Operation(
            summary = "Create a skill",
            description = "Adds a new skill for a user"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Skill created successfully",
                    content = @Content(
                            schema = @Schema(
                                    implementation = SkillResponse.class
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Invalid request payload"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "User not found"
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "Skill already exists"
            )
    })
    @PostMapping
    public SkillResponse createSkill(
            @Parameter(description = "User identifier")
            @PathVariable Long userId,

            @Valid
            @RequestBody
            SkillRequest request
    ) {

        return skillService.createSkill(userId,request);
    }

    @Operation(
            summary = "Get all skills",
            description = "Returns all skills for a user"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Skills retrieved successfully",
            content = @Content(
                    array = @ArraySchema(
                            schema = @Schema(
                                    implementation = SkillResponse.class
                            )
                    )
            )
    )
    @GetMapping
    public List<SkillResponse> getAllSkills(
            @PathVariable Long userId
    ) {

        return skillService.getAllSkills(userId);
    }


    @Operation(summary = "Get skill by ID")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Skill retrieved successfully"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Skill not found"
            )
    })
    @GetMapping("/{skillId}")
    public SkillResponse getSkillById(
            @PathVariable Long userId,
            @PathVariable Long skillId
    ) {

        return skillService.getSkillById(
                userId,
                skillId
        );
    }
    @Operation(
            summary = "Update a skill",
            description = "Updates an existing skill"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Skill updated successfully"
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Invalid request payload"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Skill not found"
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "Duplicate skill"
            )
    })
    @PutMapping("/{skillId}")
    public SkillResponse updateSkill(
            @PathVariable Long userId,
            @PathVariable Long skillId,

            @Valid
            @RequestBody
            SkillRequest request
    ) {

        return skillService.updateSkill(userId,skillId,request
        );
    }

    @Operation(
            summary = "Delete a skill"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Skill deleted successfully"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Skill not found"
            )
    })
    @DeleteMapping("/{skillId}")
    public String deleteSkill(@PathVariable Long userId,@PathVariable Long skillId) {

        skillService.deleteSkill(userId, skillId
        );

        return "Skill deleted successfully";
    }

    @Operation(summary = "Filter skills by status")
    @ApiResponse(
            responseCode = "200",
            description = "Skills retrieved successfully",
            content = @Content(
                    array = @ArraySchema(
                            schema = @Schema(
                                    implementation = SkillResponse.class
                            )
                    )
            )
    )
    @GetMapping("/status/{status}")
    public List<SkillResponse> getSkillsByStatus(@PathVariable Long userId,@PathVariable SkillStatus status) {

        return skillService.getSkillsByStatus(userId,status);
    }
}