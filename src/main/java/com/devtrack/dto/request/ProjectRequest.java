package com.devtrack.dto.request;

import com.devtrack.enums.ProjectStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectRequest {

    @NotBlank(message = "Project title is required")
    @Size(min = 3, max = 150, message = "Project title must be between 3 and 150 characters")
    private String title;

    private String description;

    @NotNull(message = "Project status is required")
    private ProjectStatus status;

}