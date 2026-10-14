package com.devtrack.security;

import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Collections;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.devtrack.dto.request.UserRequest;
import com.devtrack.entity.User;
import com.devtrack.repository.UserRepository;
import com.devtrack.service.impl.UserServiceImpl;

@ExtendWith(MockitoExtension.class)
class UserSecurityFixTest {

@Mock
private UserRepository userRepository;

@InjectMocks
private CurrentUserService currentUserService;

@AfterEach
void clearSecurityContext() {
    SecurityContextHolder.clearContext();
}

@Test
void saveUserHashesPasswordBeforePersisting() {
    when(userRepository.existsByEmail("user@example.com"))
            .thenReturn(false);

    when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
        User user = invocation.getArgument(0);
        user.setId(101L);
        return user;
    });

    PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    UserServiceImpl service = new UserServiceImpl(
            userRepository,
            passwordEncoder,
            new CurrentUserService(userRepository)
    );

    UserRequest request = new UserRequest();
    request.setName("Alice");
    request.setEmail("user@example.com");
    request.setPassword("strongPassword123");

    service.saveUser(request);

    ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
    verify(userRepository).save(captor.capture());

    User savedUser = captor.getValue();

    assertNotEquals("strongPassword123", savedUser.getPassword());
    assertTrue(
            passwordEncoder.matches(
                    "strongPassword123",
                    savedUser.getPassword()
            )
    );
}

@Test
void updateUserRejectsRequestsForAnotherUser() {
    User currentUser = new User();
    currentUser.setId(7L);
    currentUser.setEmail("owner@example.com");

    when(userRepository.findByEmail("owner@example.com"))
            .thenReturn(Optional.of(currentUser));

    SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken(
                    "owner@example.com",
                    "secret123",
                    Collections.singletonList(() -> "USER")
            )
    );

    PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    UserServiceImpl service = new UserServiceImpl(
            userRepository,
            passwordEncoder,
            new CurrentUserService(userRepository)
    );

    UserRequest request = new UserRequest();
    request.setName("Owner");
    request.setEmail("owner@example.com");
    request.setPassword("newStrongPass456");

    assertThrows(
            AccessDeniedException.class,
            () -> service.updateUser(99L, request)
    );
}

@Test
void unauthenticatedUserIsRejected() {
    SecurityContextHolder.clearContext();

    assertThrows(
            AccessDeniedException.class,
            () -> currentUserService.getCurrentUser()
    );
}

@Test
void currentUserCanAccessTheirOwnUserId() {
    User currentUser = new User();
    currentUser.setId(7L);
    currentUser.setEmail("owner@example.com");

    when(userRepository.findByEmail("owner@example.com"))
            .thenReturn(Optional.of(currentUser));

    SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken(
                    "owner@example.com",
                    "secret123",
                    Collections.singletonList(() -> "USER")
            )
    );

    User result = currentUserService.requireOwner(7L);

    assertSame(currentUser, result);
}

@Test
void currentUserCannotAccessAnotherUsersId() {
    User currentUser = new User();
    currentUser.setId(7L);
    currentUser.setEmail("owner@example.com");

    when(userRepository.findByEmail("owner@example.com"))
            .thenReturn(Optional.of(currentUser));

    SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken(
                    "owner@example.com",
                    "secret123",
                    Collections.singletonList(() -> "USER")
            )
    );

    assertThrows(
            AccessDeniedException.class,
            () -> currentUserService.requireOwner(99L)
    );
}
}
