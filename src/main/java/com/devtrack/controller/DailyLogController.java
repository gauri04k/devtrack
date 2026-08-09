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

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users/{userId}/logs")
@RequiredArgsConstructor
@Validated
@Tag(name = "Daily Logs", description = "Daily log tracking endpoints")
public class DailyLogController {

    private final DailyLogService dailyLogService;

    @Operation(summary = "Create a daily log", description = "Records a new daily log entry for a user")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Daily log created successfully", content = @Content(schema = @Schema(implementation = DailyLogResponse.class))),
        @ApiResponse(responseCode = "400", description = "Invalid request payload")
    })
    @PostMapping
    public ResponseEntity<DailyLogResponse> createDailyLog(
            @Parameter(description = "User identifier") @PathVariable Long userId,
            @Parameter(description = "Daily log payload") @Valid @RequestBody DailyLogRequest request) {

        DailyLogResponse response =
                dailyLogService.createDailyLog(userId, request);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @Operation(summary = "Get all daily logs", description = "Returns all daily logs for a user")
    @ApiResponse(responseCode = "200", description = "Daily logs retrieved successfully", content = @Content(array = @ArraySchema(schema = @Schema(implementation = DailyLogResponse.class))))
    @GetMapping
    public ResponseEntity<List<DailyLogResponse>> getAllDailyLogs(
            @Parameter(description = "User identifier") @PathVariable Long userId) {

        return ResponseEntity.ok(
                dailyLogService.getAllDailyLogs(userId));
    }

    @Operation(summary = "Get daily log by ID", description = "Fetches a specific daily log entry")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Daily log retrieved successfully", content = @Content(schema = @Schema(implementation = DailyLogResponse.class))),
        @ApiResponse(responseCode = "404", description = "Daily log not found")
    })
    @GetMapping("/{logId}")
    public ResponseEntity<DailyLogResponse> getDailyLogById(
            @Parameter(description = "User identifier") @PathVariable Long userId,
            @Parameter(description = "Daily log identifier") @PathVariable Long logId) {

        return ResponseEntity.ok(
                dailyLogService.getDailyLogById(userId, logId));
    }

    @Operation(summary = "Update a daily log", description = "Updates an existing daily log entry")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Daily log updated successfully", content = @Content(schema = @Schema(implementation = DailyLogResponse.class))),
        @ApiResponse(responseCode = "404", description = "Daily log not found")
    })
    @PutMapping("/{logId}")
    public ResponseEntity<DailyLogResponse> updateDailyLog(
            @Parameter(description = "User identifier") @PathVariable Long userId,
            @Parameter(description = "Daily log identifier") @PathVariable Long logId,
            @Parameter(description = "Updated daily log payload") @Valid @RequestBody DailyLogRequest request) {

        return ResponseEntity.ok(
                dailyLogService.updateDailyLog(userId, logId, request));
    }

    @Operation(summary = "Delete a daily log", description = "Deletes a daily log entry")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Daily log deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Daily log not found")
    })
    @DeleteMapping("/{logId}")
    public ResponseEntity<String> deleteDailyLog(
            @Parameter(description = "User identifier") @PathVariable Long userId,
            @Parameter(description = "Daily log identifier") @PathVariable Long logId) {

        dailyLogService.deleteDailyLog(userId, logId);

        return ResponseEntity.ok("Daily Log deleted successfully");
    }

    @Operation(summary = "Get daily logs by date", description = "Returns daily logs for a specific date")
    @ApiResponse(responseCode = "200", description = "Logs retrieved successfully", content = @Content(array = @ArraySchema(schema = @Schema(implementation = DailyLogResponse.class))))
    @GetMapping("/date")
    public ResponseEntity<List<DailyLogResponse>> getLogsByDate(
            @Parameter(description = "User identifier") @PathVariable Long userId,
            @Parameter(description = "Date to filter by", example = "2026-08-09") @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date) {

        return ResponseEntity.ok(
                dailyLogService.getLogsByDate(userId, date));
    }

    @Operation(summary = "Get weekly summary", description = "Returns the weekly logged hours total")
    @ApiResponse(responseCode = "200", description = "Weekly summary retrieved successfully", content = @Content(schema = @Schema(implementation = BigDecimal.class)))
    @GetMapping("/weekly-summary")
    public ResponseEntity<BigDecimal> getWeeklySummary(
            @Parameter(description = "User identifier") @PathVariable Long userId) {

        return ResponseEntity.ok(
                dailyLogService.getWeeklyHours(userId));
    }

}