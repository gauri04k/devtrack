package com.devtrack.dto.response;

import java.time.LocalDate;

import com.devtrack.enums.MilestoneStatus;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MilestoneResponse {

    private Long id;

    private String title;

    private MilestoneStatus status;

    private LocalDate dueDate;

    private Long projectId;

}