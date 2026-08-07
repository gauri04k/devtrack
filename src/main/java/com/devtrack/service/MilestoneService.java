package com.devtrack.service;

import java.util.List;
import com.devtrack.dto.request.MilestoneRequest;
import com.devtrack.dto.response.MilestoneResponse;

public interface MilestoneService {

    MilestoneResponse createMilestone(Long projectId,MilestoneRequest request);
    
    List<MilestoneResponse> getAllMilestones(Long projectId);
    
    MilestoneResponse updateMilestone(Long milestoneId, MilestoneRequest request);

    void deleteMilestone(Long milestoneId);

}