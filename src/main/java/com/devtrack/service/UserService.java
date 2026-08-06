package com.devtrack.service;

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

@Service
public class UserService {
	
	private final UserRepository userRepository;
	
	public UserService(UserRepository userRepository) {
		this.userRepository = userRepository; //first assignment allowed bcz of final :) 
		//jabb baad mai koi assign kre tto it gives compile time error
		//Because final doesn't allow reassigning the reference.//immutability dependency 
	}
	
	//spring data jpa provides these method like save.
	//spring data jpa already implemented for you 
	
//	public User saveUser(User user) {
//		return userRepository.save(user);
//		
//	} not industry level
	
	
	public UserResponse saveUser(UserRequest request) {
		
		
		 if (userRepository.existsByEmail(request.getEmail())) {
	            throw new DuplicateEmailException("Email already exists");
	        }
		
	
		//1. create entity
		User user = new User();
		
		//2. copy request DTO -> Entity
		user.setName(request.getName());
		user.setEmail(request.getEmail());
		user.setPassword(request.getPassword());
		user.setCreatedAt(LocalDateTime.now());
		
		//3. save Entity
		User savedUser = userRepository.save(user);
		
		//4.create Response DTO
		UserResponse response = new UserResponse();
		
		//5. Copy entity -> response dto
		response.setId(savedUser.getId());
		response.setName(savedUser.getName());
		response.setEmail(savedUser.getEmail());
		response.setCreatedAt(savedUser.getCreatedAt());
		
		// 6.required data only transfer kiya jayega
		return response;
	}
	
	//getallusers

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
	//getuserbyid
	
	public UserResponse getUserById(Long id) {

	    User user = userRepository.findById(id)
	            .orElseThrow(() ->
	                    new ResourceNotFoundException(
	                            "User not found with id : " + id));

	    UserResponse response = new UserResponse();

	    response.setId(user.getId());
	    response.setName(user.getName());
	    response.setEmail(user.getEmail());
	    response.setCreatedAt(user.getCreatedAt());

	    return response;
	}
	//update users
	 
	public UserResponse updateUser(Long id, UserRequest request) {

	    User user = userRepository.findById(id)
	            .orElseThrow(() ->
	                    new ResourceNotFoundException(
	                            "User not found with id : " + id));

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
	
	//delete
	public void deleteUser(Long id) {

	    User user = userRepository.findById(id)
	            .orElseThrow(() ->
	                    new ResourceNotFoundException(
	                            "User not found with id : " + id));

	    userRepository.delete(user);
	}
	
	
	
	
}
