package com.devtrack.mapper;

import org.springframework.stereotype.Component;

import com.devtrack.dto.request.DailyLogRequest;
import com.devtrack.dto.response.DailyLogResponse;
import com.devtrack.entity.DailyLog;

@Component
public class DailyLogMapper {
    public DailyLogResponse toResponse(DailyLog dailyLog) {
    	
        return DailyLogResponse.builder()

                .id(dailyLog.getId())
                .userId(dailyLog.getUser() != null ? dailyLog.getUser().getId(): null)
                .skillId(dailyLog.getSkill() != null ? dailyLog.getSkill().getId() : null)
                .skillName(dailyLog.getSkill() != null ? dailyLog.getSkill().getName() : null)
                .topic(dailyLog.getTopic())
                .hours(dailyLog.getHours())
                .notes(dailyLog.getNotes())
                .logDate(dailyLog.getLogDate())
                .build();
    }


    public DailyLog toEntity(DailyLogRequest request) {
        return DailyLog.builder()
                .topic(request.getTopic())
                .hours(request.getHours())
                .notes(request.getNotes())
                .logDate(request.getLogDate())
                .build();
    }
}