package com.devtrack.controller;

import java.util.List;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.devtrack.dto.request.ProjectRequest;
import com.devtrack.dto.response.ProjectResponse;
import com.devtrack.enums.ProjectStatus;
import com.devtrack.service.ProjectService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users/{userId}/projects")
@Validated
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @PostMapping
    public ProjectResponse createProject(@PathVariable Long userId,@Valid @RequestBody ProjectRequest request) {
        return projectService.createProject(userId, request);
    }

    @GetMapping
    public List<ProjectResponse> getAllProjects(@PathVariable Long userId) {
        return projectService.getAllProjects(userId);
    }

    @GetMapping("/{projectId}")
    public ProjectResponse getProjectById(@PathVariable Long userId,
                                          @PathVariable Long projectId) {
        return projectService.getProjectById(userId, projectId);
    }

    @PutMapping("/{projectId}")
    public ProjectResponse updateProject(@PathVariable Long userId,@PathVariable Long projectId,@Valid @RequestBody ProjectRequest request) {
        return projectService.updateProject(userId, projectId, request);
    }

    @DeleteMapping("/{projectId}")
    public String deleteProject(@PathVariable Long userId,@PathVariable Long projectId) {
        projectService.deleteProject(userId, projectId);
        return "Project deleted successfully";
    }

    @GetMapping("/status/{status}")
    public List<ProjectResponse> getProjectsByStatus(@PathVariable Long userId,@PathVariable ProjectStatus status) {
        return projectService.getProjectsByStatus(userId, status);
    }
}