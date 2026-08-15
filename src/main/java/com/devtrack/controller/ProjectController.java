package com.devtrack.controller;

import java.util.List;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.devtrack.dto.request.ProjectRequest;
import com.devtrack.dto.response.ProjectResponse;
import com.devtrack.enums.ProjectStatus;
import com.devtrack.service.ProjectService;

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
@RequestMapping("/api/users/{userId}/projects")
@Validated
@Tag(name = "Projects", description = "Project management endpoints")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @Operation(summary = "Create a project", description = "Creates a new project for a user")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Project created successfully", content = @Content(schema = @Schema(implementation = ProjectResponse.class))),
        @ApiResponse(responseCode = "400", description = "Invalid request payload")
    })
    
    @PostMapping
    public ProjectResponse createProject(@Parameter(description = "User identifier") @PathVariable Long userId,
                                         @Parameter(description = "Project creation payload") @Valid @RequestBody ProjectRequest request) {
        return projectService.createProject(userId, request);
    }

    @Operation(summary = "Get all projects", description = "Returns all projects belonging to a user")
    @ApiResponse(responseCode = "200", description = "Projects retrieved successfully", content = @Content(array = @ArraySchema(schema = @Schema(implementation = ProjectResponse.class))))
    @GetMapping
    public List<ProjectResponse> getAllProjects(@Parameter(description = "User identifier") @PathVariable Long userId) {
        return projectService.getAllProjects(userId);
    }

    @Operation(summary = "Get project by ID", description = "Fetches a specific project for a user")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Project retrieved successfully", content = @Content(schema = @Schema(implementation = ProjectResponse.class))),
        @ApiResponse(responseCode = "404", description = "Project not found")
    })
    @GetMapping("/{projectId}")
    public ProjectResponse getProjectById(@Parameter(description = "User identifier") @PathVariable Long userId,
                                          @Parameter(description = "Project identifier") @PathVariable Long projectId) {
        return projectService.getProjectById(userId, projectId);
    }

    @Operation(summary = "Update a project", description = "Updates an existing project")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Project updated successfully", content = @Content(schema = @Schema(implementation = ProjectResponse.class))),
        @ApiResponse(responseCode = "404", description = "Project not found")
    })
    @PutMapping("/{projectId}")
    public ProjectResponse updateProject(@Parameter(description = "User identifier") @PathVariable Long userId,
                                         @Parameter(description = "Project identifier") @PathVariable Long projectId,
                                         @Parameter(description = "Updated project payload") @Valid @RequestBody ProjectRequest request) {
        return projectService.updateProject(userId, projectId, request);
    }

    @Operation(summary = "Delete a project", description = "Deletes a project belonging to a user")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Project deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Project not found")
    })
    @DeleteMapping("/{projectId}")
    public String deleteProject(@Parameter(description = "User identifier") @PathVariable Long userId,
                                @Parameter(description = "Project identifier") @PathVariable Long projectId) {
        projectService.deleteProject(userId, projectId);
        return "Project deleted successfully";
    }

    @Operation(summary = "Filter projects by status", description = "Lists all projects for a user filtered by status")
    @ApiResponse(responseCode = "200", description = "Projects retrieved successfully", content = @Content(array = @ArraySchema(schema = @Schema(implementation = ProjectResponse.class))))
    @GetMapping("/status/{status}")
    public List<ProjectResponse> getProjectsByStatus(@Parameter(description = "User identifier") @PathVariable Long userId,
                                                    @Parameter(description = "Project status filter") @PathVariable ProjectStatus status) {
        return projectService.getProjectsByStatus(userId, status);
    }
}