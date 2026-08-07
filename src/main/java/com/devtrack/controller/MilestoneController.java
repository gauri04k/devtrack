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

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Validated
public class MilestoneController {

    private final MilestoneService milestoneService;

    //create milestone
    @PostMapping("/projects/{projectId}/milestones")
    public ResponseEntity<MilestoneResponse> createMilestone( @PathVariable Long projectId,@Valid @RequestBody MilestoneRequest request) {

        MilestoneResponse response = milestoneService.createMilestone(projectId, request);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // get all milestone of project
    @GetMapping("/projects/{projectId}/milestones")
    public ResponseEntity<List<MilestoneResponse>> getAllMilestones(@PathVariable Long projectId) {
        return ResponseEntity.ok(
                milestoneService.getAllMilestones(projectId));
    }

    // update milestone
    @PutMapping("/milestones/{milestoneId}")
    public ResponseEntity<MilestoneResponse> updateMilestone(
            @PathVariable Long milestoneId,
            @Valid @RequestBody MilestoneRequest request) {

        return ResponseEntity.ok(milestoneService.updateMilestone(milestoneId, request));
    }

    // delete milestone
    @DeleteMapping("/milestones/{milestoneId}")
    public ResponseEntity<String> deleteMilestone(@PathVariable Long milestoneId) {

        milestoneService.deleteMilestone(milestoneId);

        return ResponseEntity.ok("Milestone deleted successfully.");
    }

}