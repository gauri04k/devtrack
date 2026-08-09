package com.devtrack.service.impl;

import java.time.LocalDateTime;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devtrack.dto.request.AuthRequest;
import com.devtrack.dto.request.RegisterRequest;
import com.devtrack.dto.response.AuthResponse;
import com.devtrack.entity.User;
import com.devtrack.repository.UserRepository;
import com.devtrack.security.JwtUtil;
import com.devtrack.service.AuthService;

import lombok.RequiredArgsConstructor;

  @Service
  @RequiredArgsConstructor
  @Transactional
  public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    @Override
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());

        user.setPassword(
            passwordEncoder.encode(request.getPassword())
        );

        user.setCreatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        String token = jwtUtil.generateToken(savedUser.getEmail());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .build();
    }

          @Override
          @Transactional(readOnly = true)
          public AuthResponse login(AuthRequest request) {
             Authentication authentication = authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                request.getEmail(),
                                request.getPassword()
                        )
                );

                String email = authentication.getName();
                User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email : " + email)
                );

        String token = jwtUtil.generateToken(user.getEmail());
            return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .build();
        }
    }