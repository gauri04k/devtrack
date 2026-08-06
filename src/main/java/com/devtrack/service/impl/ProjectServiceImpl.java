package com.devtrack.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devtrack.dto.request.ProjectRequest;
import com.devtrack.dto.response.ProjectResponse;
import com.devtrack.entity.Project;
import com.devtrack.entity.User;
import com.devtrack.enums.ProjectStatus;
import com.devtrack.exception.ResourceNotFoundException;
import com.devtrack.mapper.ProjectMapper;
import com.devtrack.repository.ProjectRepository;
import com.devtrack.repository.UserRepository;
import com.devtrack.service.ProjectService;

@Service
@Transactional
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public ProjectServiceImpl(ProjectRepository projectRepository,
                              UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    @Override
    public ProjectResponse createProject(Long userId,
                                         ProjectRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found with id : " + userId));

        if (projectRepository.existsByTitleIgnoreCaseAndUser(request.getTitle(), user)) {
            throw new RuntimeException("Project already exists");
        }

        Project project = ProjectMapper.toEntity(request);

        project.setUser(user);

        Project savedProject = projectRepository.save(project);

        return ProjectMapper.toResponse(savedProject);
    }

    @Override
    public List<ProjectResponse> getAllProjects(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found with id : " + userId));

        return projectRepository.findByUser(user)
                .stream()
                .map(ProjectMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ProjectResponse getProjectById(Long userId,
                                          Long projectId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found with id : " + userId));

        Project project = projectRepository.findByIdAndUser(projectId, user)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Project not found with id : " + projectId));

        return ProjectMapper.toResponse(project);
    }

    @Override
    public ProjectResponse updateProject(Long userId,
                                         Long projectId,
                                         ProjectRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found with id : " + userId));

        Project project = projectRepository.findByIdAndUser(projectId, user)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Project not found with id : " + projectId));

        if (!project.getTitle().equalsIgnoreCase(request.getTitle())
                && projectRepository.existsByTitleIgnoreCaseAndUser(request.getTitle(), user)) {
            throw new RuntimeException("Project already exists");
        }

        project.setTitle(request.getTitle());
        project.setDescription(request.getDescription());
        project.setStatus(request.getStatus());

        Project updatedProject = projectRepository.save(project);

        return ProjectMapper.toResponse(updatedProject);
    }

    @Override
    public void deleteProject(Long userId,
                              Long projectId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found with id : " + userId));

        Project project = projectRepository.findByIdAndUser(projectId, user)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Project not found with id : " + projectId));

        projectRepository.delete(project);
    }

    @Override
    public List<ProjectResponse> getProjectsByStatus(Long userId,
                                                     ProjectStatus status) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found with id : " + userId));

        return projectRepository.findByUserAndStatus(user, status)
                .stream()
                .map(ProjectMapper::toResponse)
                .collect(Collectors.toList());
    }

}