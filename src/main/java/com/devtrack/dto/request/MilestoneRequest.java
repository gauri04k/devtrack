package com.devtrack.dto.request;

import java.time.LocalDate;

import com.devtrack.enums.MilestoneStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MilestoneRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotNull(message = "Status is required")
    private MilestoneStatus status;

    private LocalDate dueDate;

}