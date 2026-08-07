package com.devtrack.mapper;

import org.springframework.stereotype.Component;

import com.devtrack.dto.request.DailyLogRequest;
import com.devtrack.dto.response.DailyLogResponse;
import com.devtrack.entity.DailyLog;

@Component
public class DailyLogMapper {

    // Convert Entity -> Response DTO
    public DailyLogResponse toResponse(DailyLog dailyLog) {

        return DailyLogResponse.builder()
                .id(dailyLog.getId())
                .userId(dailyLog.getUser().getId())
                .skillId(dailyLog.getSkill() != null ? dailyLog.getSkill().getId() : null)
                .topic(dailyLog.getTopic())
                .hours(dailyLog.getHours())
                .notes(dailyLog.getNotes())
                .logDate(dailyLog.getLogDate())
                .build();
    }

    // Convert Request DTO -> Entity
    public DailyLog toEntity(DailyLogRequest request) {
        return DailyLog.builder()
                .topic(request.getTopic())
                .hours(request.getHours())
                .notes(request.getNotes())
                .logDate(request.getLogDate())
                .build();
    }
}