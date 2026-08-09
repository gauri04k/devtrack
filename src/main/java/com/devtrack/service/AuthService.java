package com.devtrack.service;

import com.devtrack.dto.request.AuthRequest;
import com.devtrack.dto.request.RegisterRequest;
import com.devtrack.dto.response.AuthResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);
    AuthResponse login(AuthRequest request);
}