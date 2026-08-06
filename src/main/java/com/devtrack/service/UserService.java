package com.devtrack.service;

import java.util.List;

import com.devtrack.dto.request.UserRequest;
import com.devtrack.dto.response.UserResponse;

public interface UserService {

    UserResponse saveUser(UserRequest request);

    List<UserResponse> getAllUsers();

    UserResponse getUserById(Long id);

    UserResponse updateUser(Long id, UserRequest request);

    void deleteUser(Long id);

}