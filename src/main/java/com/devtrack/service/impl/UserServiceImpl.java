package com.devtrack.service.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.devtrack.dto.request.UserRequest;
import com.devtrack.dto.response.UserResponse;
import com.devtrack.entity.User;
import com.devtrack.exception.DuplicateEmailException;
import com.devtrack.exception.ResourceNotFoundException;
import com.devtrack.repository.UserRepository;
import com.devtrack.service.UserService;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserResponse saveUser(UserRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEmailException("Email already exists");
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setCreatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        UserResponse response = new UserResponse();

        response.setId(savedUser.getId());
        response.setName(savedUser.getName());
        response.setEmail(savedUser.getEmail());
        response.setCreatedAt(savedUser.getCreatedAt());

        return response;
    }

    @Override
    public List<UserResponse> getAllUsers() {

        List<User> users = userRepository.findAll();
        List<UserResponse> responses = new ArrayList<>();

        for (User user : users) {

            UserResponse response = new UserResponse();

            response.setId(user.getId());
            response.setName(user.getName());
            response.setEmail(user.getEmail());
            response.setCreatedAt(user.getCreatedAt());

            responses.add(response);
        }

        return responses;
    }

    @Override
    public UserResponse getUserById(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found with id : " + id));

        UserResponse response = new UserResponse();

        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setCreatedAt(user.getCreatedAt());

        return response;
    }

    @Override
    public UserResponse updateUser(Long id, UserRequest request) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found with id : " + id));

        if (!user.getEmail().equals(request.getEmail())
                && userRepository.existsByEmail(request.getEmail())) {

            throw new DuplicateEmailException("Email already exists");
        }

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());

        User updatedUser = userRepository.save(user);

        UserResponse response = new UserResponse();

        response.setId(updatedUser.getId());
        response.setName(updatedUser.getName());
        response.setEmail(updatedUser.getEmail());
        response.setCreatedAt(updatedUser.getCreatedAt());

        return response;
    }

    @Override
    public void deleteUser(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found with id : " + id));

        userRepository.delete(user);
    }

}