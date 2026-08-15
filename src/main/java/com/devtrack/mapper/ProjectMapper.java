package com.devtrack.mapper;

import com.devtrack.dto.request.ProjectRequest;
import com.devtrack.dto.response.ProjectResponse;
import com.devtrack.entity.Project;

public class ProjectMapper {
    private ProjectMapper() {
    	
    }
    public static Project toEntity(ProjectRequest request) {

        if (request == null) {
            return null;
        }
        return Project.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus())
                .build();
    }

    public static ProjectResponse toResponse(Project project) {
        if (project == null) {
            return null;
        }
        return ProjectResponse.builder()
                .id(project.getId())
                .title(project.getTitle())
                .description(project.getDescription())
                .status(project.getStatus())
                .build();
    }

}