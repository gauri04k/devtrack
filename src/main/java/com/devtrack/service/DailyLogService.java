package com.devtrack.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.devtrack.dto.request.DailyLogRequest;
import com.devtrack.dto.response.DailyLogResponse;

public interface DailyLogService {

    DailyLogResponse createDailyLog(Long userId,DailyLogRequest request);

    List<DailyLogResponse> getAllDailyLogs(Long userId);

    DailyLogResponse getDailyLogById(Long userId,Long logId);

    DailyLogResponse updateDailyLog(Long userId,Long logId,DailyLogRequest request);

    void deleteDailyLog(Long userId,Long logId);

    List<DailyLogResponse> getLogsByDate(Long userId,LocalDate date);

    BigDecimal getWeeklyHours(Long userId);
}