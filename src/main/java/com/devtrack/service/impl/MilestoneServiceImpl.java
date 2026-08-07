package com.devtrack.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.devtrack.dto.request.MilestoneRequest;
import com.devtrack.dto.response.MilestoneResponse;
import com.devtrack.entity.Milestone;
import com.devtrack.entity.Project;
import com.devtrack.repository.MilestoneRepository;
import com.devtrack.repository.ProjectRepository;
import com.devtrack.service.MilestoneService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class MilestoneServiceImpl implements MilestoneService {

    private final MilestoneRepository milestoneRepository;
    private final ProjectRepository projectRepository;

    @Override
    public MilestoneResponse createMilestone(Long projectId,MilestoneRequest request) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() ->new RuntimeException("Project not found"));

        Milestone milestone = Milestone.builder()
                .title(request.getTitle())
                .status(request.getStatus())
                .dueDate(request.getDueDate())
                .project(project)
                .build();

        milestoneRepository.save(milestone);

        return mapToResponse(milestone);
    }

    @Override
    public List<MilestoneResponse> getAllMilestones(Long projectId) {

        return milestoneRepository.findByProjectId(projectId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public MilestoneResponse updateMilestone(Long milestoneId,MilestoneRequest request) {
        Milestone milestone = milestoneRepository.findById(milestoneId)
                .orElseThrow(() ->new RuntimeException("Milestone not found"));

        milestone.setTitle(request.getTitle());
        milestone.setStatus(request.getStatus());
        milestone.setDueDate(request.getDueDate());

        milestoneRepository.save(milestone);
        
        return mapToResponse(milestone);
    }

    @Override
    public void deleteMilestone(Long milestoneId) {

        Milestone milestone = milestoneRepository.findById(milestoneId).orElseThrow(() ->
                              new RuntimeException("Milestone not found"));
        
        milestoneRepository.delete(milestone);
    }

    private MilestoneResponse mapToResponse(Milestone milestone) {

        return MilestoneResponse.builder()
                .id(milestone.getId())
                .title(milestone.getTitle())
                .status(milestone.getStatus())
                .dueDate(milestone.getDueDate())
                .projectId(milestone.getProject().getId())
                .build();
    }

}