package com.devtrack.service;

import com.devtrack.dto.response.DashboardResponse;

public interface DashboardService {

    DashboardResponse getDashboard(Long userId);
}