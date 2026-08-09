package com.devtrack.service.impl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devtrack.dto.response.DashboardResponse;
import com.devtrack.dto.response.RecentActivityResponse;
import com.devtrack.entity.DailyLog;
import com.devtrack.enums.SkillStatus;
import com.devtrack.repository.DailyLogRepository;
import com.devtrack.repository.ProjectRepository;
import com.devtrack.repository.SkillRepository;
import com.devtrack.repository.UserRepository;
import com.devtrack.service.DashboardService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class DashboardServiceImpl implements DashboardService {

    private final SkillRepository skillRepository;
    private final ProjectRepository projectRepository;
    private final DailyLogRepository dailyLogRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(Long userId) {

        userRepository.findById(userId)
                .orElseThrow(() ->new RuntimeException("User not found with id : " + userId));

        long learningSkills = skillRepository.countByUserIdAndStatus(userId,SkillStatus.LEARNING);
        long completedSkills = skillRepository.countByUserIdAndStatus(userId,SkillStatus.COMPLETED);
        long pausedSkills = skillRepository.countByUserIdAndStatus(userId,SkillStatus.PAUSED);

        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(6);

        BigDecimal weeklyHours = dailyLogRepository.getWeeklyHours(userId,startDate,endDate);

        if (weeklyHours == null) {
            weeklyHours = BigDecimal.ZERO;
        }

        long activeProjects = projectRepository.countActiveProjectsByUserId(userId);

        List<RecentActivityResponse> recentActivity = dailyLogRepository
                        .findTop5ByUserIdOrderByLogDateDescIdDesc(userId)
                        .stream()
                        .map(this::mapToRecentActivity)
                        .collect(Collectors.toList());

        return DashboardResponse.builder()
                .learningSkills(learningSkills)
                .completedSkills(completedSkills)
                .pausedSkills(pausedSkills)
                .weeklyHours(weeklyHours)
                .activeProjects(activeProjects)
                .recentActivity(recentActivity)
                .build();
    }

    private RecentActivityResponse mapToRecentActivity(DailyLog log) {

        return RecentActivityResponse.builder()
                .id(log.getId())
                .topic(log.getTopic())
                .hours(log.getHours())
                .logDate(log.getLogDate())
                .build();
    }
}