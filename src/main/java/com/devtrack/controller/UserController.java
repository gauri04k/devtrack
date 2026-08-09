package com.devtrack.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.devtrack.dto.request.UserRequest;
import com.devtrack.dto.response.UserResponse;
import com.devtrack.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
@Validated
@Tag(name = "Users", description = "User management endpoints")
public class UserController {
	
    private final UserService userService;
    
    //if we use new keyword here ..may loose the benefits of ioc  and di
   
    public UserController(UserService userService) {
    	this.userService = userService;
    }
    
    @Operation(summary = "Create a user", description = "Registers a new user account")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "User created successfully", content = @Content(schema = @Schema(implementation = UserResponse.class))),
        @ApiResponse(responseCode = "400", description = "Invalid request payload")
    })
    @PostMapping
    public UserResponse createUser(@Parameter(description = "User registration payload") @Valid @RequestBody UserRequest request) {
        return userService.saveUser(request);
    }

    @Operation(summary = "Get all users", description = "Returns all registered users")
    @ApiResponse(responseCode = "200", description = "Users retrieved successfully", content = @Content(array = @ArraySchema(schema = @Schema(implementation = UserResponse.class))))
    @GetMapping
    public List<UserResponse> getAllUsers(){
        return userService.getAllUsers();
    }

    @Operation(summary = "Get user by ID", description = "Fetches a single user by their identifier")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "User retrieved successfully", content = @Content(schema = @Schema(implementation = UserResponse.class))),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    @GetMapping("/{id}")
    public UserResponse getUserById(@Parameter(description = "User identifier") @PathVariable Long id){
        return userService.getUserById(id);
    }

    @Operation(summary = "Update a user", description = "Updates an existing user record")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "User updated successfully", content = @Content(schema = @Schema(implementation = UserResponse.class))),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    @PutMapping("/{id}")
    public UserResponse updateUser(@Parameter(description = "User identifier") @PathVariable Long id,
                                   @Parameter(description = "Updated user payload") @RequestBody UserRequest request) {
        return userService.updateUser(id, request);
    }

    @Operation(summary = "Delete a user", description = "Deletes a user from the system")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "User deleted successfully"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@Parameter(description = "User identifier") @PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully");
    }
    
    
    
}