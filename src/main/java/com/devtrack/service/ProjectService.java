package com.devtrack.service;

import java.util.List;

import com.devtrack.dto.request.ProjectRequest;
import com.devtrack.dto.response.ProjectResponse;
import com.devtrack.enums.ProjectStatus;

public interface ProjectService {

    ProjectResponse createProject(Long userId, ProjectRequest request);

    List<ProjectResponse> getAllProjects(Long userId);

    ProjectResponse getProjectById(Long userId, Long projectId);

    ProjectResponse updateProject(Long userId, Long projectId, ProjectRequest request);

    void deleteProject(Long userId, Long projectId);

    List<ProjectResponse> getProjectsByStatus(Long userId,
                                              ProjectStatus status);

}