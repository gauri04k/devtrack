package com.devtrack.security;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.context.SecurityContextHolder;

import com.devtrack.entity.User;
import com.devtrack.exception.ResourceNotFoundException;
import com.devtrack.repository.ProjectRepository;
import com.devtrack.repository.UserRepository;
import com.devtrack.service.impl.ProjectServiceImpl;

@ExtendWith(MockitoExtension.class)
class ProjectOwnershipTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CurrentUserService currentUserService;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void userCannotReadAnotherUsersProject() {
        User userA = new User();
        userA.setId(7L);
        userA.setEmail("owner@example.com");

        when(currentUserService.requireOwner(7L)).thenReturn(userA);
        when(userRepository.findById(7L)).thenReturn(Optional.of(userA));
        when(projectRepository.findByIdAndUser(55L, userA))
                .thenReturn(Optional.empty());

        ProjectServiceImpl service = new ProjectServiceImpl(
                projectRepository,
                userRepository,
                currentUserService
        );

        assertThrows(
                ResourceNotFoundException.class,
                () -> service.getProjectById(7L, 55L)
        );

        verify(projectRepository).findByIdAndUser(55L, userA);
    }
}

