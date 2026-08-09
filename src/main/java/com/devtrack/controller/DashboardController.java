package com.devtrack.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.devtrack.dto.response.DashboardResponse;
import com.devtrack.service.DashboardService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users/{userId}/dashboard")
public class DashboardController {

         private final DashboardService dashboardService;

         @GetMapping
         public ResponseEntity<DashboardResponse> getDashboard(@PathVariable Long userId) {

         DashboardResponse response = dashboardService.getDashboard(userId);

      return ResponseEntity.ok(response);
    }
}