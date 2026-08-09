package com.devtrack.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.devtrack.dto.request.MilestoneRequest;
import com.devtrack.dto.response.MilestoneResponse;
import com.devtrack.service.MilestoneService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Validated
@Tag(name = "Milestones", description = "Milestone management endpoints")
public class MilestoneController {

    private final MilestoneService milestoneService;

    @Operation(summary = "Create a milestone", description = "Creates a milestone for a project")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Milestone created successfully", content = @Content(schema = @Schema(implementation = MilestoneResponse.class))),
        @ApiResponse(responseCode = "400", description = "Invalid request payload")
    })
    @PostMapping("/projects/{projectId}/milestones")
    public ResponseEntity<MilestoneResponse> createMilestone(@Parameter(description = "Project identifier") @PathVariable Long projectId,
                                                             @Parameter(description = "Milestone payload") @Valid @RequestBody MilestoneRequest request) {

        MilestoneResponse response = milestoneService.createMilestone(projectId, request);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @Operation(summary = "Get all milestones", description = "Returns all milestones for a project")
    @ApiResponse(responseCode = "200", description = "Milestones retrieved successfully", content = @Content(array = @ArraySchema(schema = @Schema(implementation = MilestoneResponse.class))))
    @GetMapping("/projects/{projectId}/milestones")
    public ResponseEntity<List<MilestoneResponse>> getAllMilestones(@Parameter(description = "Project identifier") @PathVariable Long projectId) {
        return ResponseEntity.ok(
                milestoneService.getAllMilestones(projectId));
    }

    @Operation(summary = "Update a milestone", description = "Updates an existing milestone")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Milestone updated successfully", content = @Content(schema = @Schema(implementation = MilestoneResponse.class))),
        @ApiResponse(responseCode = "404", description = "Milestone not found")
    })
    @PutMapping("/milestones/{milestoneId}")
    public ResponseEntity<MilestoneResponse> updateMilestone(
            @Parameter(description = "Milestone identifier") @PathVariable Long milestoneId,
            @Parameter(description = "Updated milestone payload") @Valid @RequestBody MilestoneRequest request) {

        return ResponseEntity.ok(milestoneService.updateMilestone(milestoneId, request));
    }

    @Operation(summary = "Delete a milestone", description = "Deletes a milestone")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Milestone deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Milestone not found")
    })
    @DeleteMapping("/milestones/{milestoneId}")
    public ResponseEntity<String> deleteMilestone(@Parameter(description = "Milestone identifier") @PathVariable Long milestoneId) {

        milestoneService.deleteMilestone(milestoneId);

        return ResponseEntity.ok("Milestone deleted successfully.");
    }

}