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

import com.devtrack.entity.User;
import com.devtrack.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
@Validated
public class UserController {
	
    private final UserService userService;
    
    //if we use new keyword here ..may loose the benefits of ioc 
    //and dependency injection
    
    public UserController(UserService userService) {
    	this.userService = userService;
    }
    
    @PostMapping
    public UserResponse createUser(@Valid @RequestBody UserRequest request) {
        return userService.saveUser(request);
    }
    
    
    @GetMapping
    public List<UserResponse> getAllUsers(){
    	return userService.getAllUsers();
    }
    
    
    @GetMapping("/{id}")
    public UserResponse getUserById(@PathVariable Long id){
        return userService.getUserById(id);
    }
    
    
    @PutMapping("/{id}")
    public UserResponse updateUser(@PathVariable Long id,@RequestBody UserRequest request) {
        return userService.updateUser(id, request);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {

        userService.deleteUser(id);

        return ResponseEntity.ok("User deleted successfully");
    }
    
    
    
}