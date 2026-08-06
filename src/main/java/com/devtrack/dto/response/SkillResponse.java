package com.devtrack.dto.response;

import java.time.LocalDate;

import com.devtrack.enums.SkillStatus;

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
public class SkillResponse {

    private Long id;

    private String name;

    private SkillStatus status;

    private LocalDate targetDate;

}