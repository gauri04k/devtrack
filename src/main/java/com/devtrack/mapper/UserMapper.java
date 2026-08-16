package com.devtrack.mapper;

import com.devtrack.dto.request.UserRequest;
import com.devtrack.dto.response.UserResponse;
import com.devtrack.entity.User;

public class UserMapper {

    private UserMapper() {
    	
    }

    public static User toEntity(UserRequest request) {
        if (request == null) {
            return null;
        }

       return User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(request.getPassword()).build();
    }

    public static UserResponse toResponse(User user) {
        if (user == null) {
            return null;
        }
        return UserResponse.builder().id(user.getId()).name(user.getName()).email(user.getEmail()).build();
    }

}