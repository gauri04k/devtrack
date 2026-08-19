package com.devtrack.dto.response;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {

    private long learningSkills;
    private long completedSkills;
    private long pausedSkills;
    private BigDecimal weeklyHours;
    private long activeProjects;

    private List<RecentActivityResponse> recentActivity;
    private List<WeeklyActivityResponse> weeklyActivity;
}