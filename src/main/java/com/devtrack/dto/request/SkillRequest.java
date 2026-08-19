package com.devtrack.dto.request;

import java.time.LocalDate;

import com.devtrack.enums.SkillStatus;

import jakarta.validation.constraints.FutureOrPresent;
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
public class SkillRequest {

    @NotBlank(message = "Skill name is required")
    @Size(
        min = 2,
        max = 100,
        message = "Skill name must be between 2 and 100 characters"
    )
    private String name;

    @NotNull(message = "Skill status is required")
    private SkillStatus status;

    @FutureOrPresent(message = "Target date cannot be in the past")
    private LocalDate targetDate;
}