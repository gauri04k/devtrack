package com.devtrack.controller;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.devtrack.dto.request.DailyLogRequest;
import com.devtrack.dto.response.DailyLogResponse;
import com.devtrack.service.DailyLogService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users/{userId}/logs")
@RequiredArgsConstructor
@Validated
public class DailyLogController {

    private final DailyLogService dailyLogService;

    // Create Daily Log
    @PostMapping
    public ResponseEntity<DailyLogResponse> createDailyLog(
            @PathVariable Long userId,
            @Valid @RequestBody DailyLogRequest request) {

        DailyLogResponse response =
                dailyLogService.createDailyLog(userId, request);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // Get All Daily Logs
    @GetMapping
    public ResponseEntity<List<DailyLogResponse>> getAllDailyLogs(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                dailyLogService.getAllDailyLogs(userId));
    }

    // Get Daily Log By Id
    @GetMapping("/{logId}")
    public ResponseEntity<DailyLogResponse> getDailyLogById(
            @PathVariable Long userId,
            @PathVariable Long logId) {

        return ResponseEntity.ok(
                dailyLogService.getDailyLogById(userId, logId));
    }

    // Update Daily Log
    @PutMapping("/{logId}")
    public ResponseEntity<DailyLogResponse> updateDailyLog(
            @PathVariable Long userId,
            @PathVariable Long logId,
            @Valid @RequestBody DailyLogRequest request) {

        return ResponseEntity.ok(
                dailyLogService.updateDailyLog(userId, logId, request));
    }

    // Delete Daily Log
    @DeleteMapping("/{logId}")
    public ResponseEntity<String> deleteDailyLog(
            @PathVariable Long userId,
            @PathVariable Long logId) {

        dailyLogService.deleteDailyLog(userId, logId);

        return ResponseEntity.ok("Daily Log deleted successfully");
    }

    // Get Logs By Date
    @GetMapping("/date")
    public ResponseEntity<List<DailyLogResponse>> getLogsByDate(
            @PathVariable Long userId,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date) {

        return ResponseEntity.ok(
                dailyLogService.getLogsByDate(userId, date));
    }

    // Weekly Summary
    @GetMapping("/weekly-summary")
    public ResponseEntity<BigDecimal> getWeeklySummary(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                dailyLogService.getWeeklyHours(userId));
    }

}