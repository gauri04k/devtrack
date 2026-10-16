package com.devtrack.security;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import com.devtrack.entity.User;
import com.devtrack.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class CurrentUserService {

    private final UserRepository userRepository;

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            throw new AccessDeniedException("Authentication is required");
        }

        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AccessDeniedException("Authenticated user not found"));
    }

    public User requireOwner(Long userId) {
        User currentUser = getCurrentUser();

        if (!currentUser.getId().equals(userId)) {
            throw new AccessDeniedException("You are not allowed to access this user's resources");
        }

        return currentUser;
    }
}
