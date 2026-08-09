package com.devtrack.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NoteRequest {
	   @NotBlank(message = "Title is required")
	    @Size(max = 150, message = "Title must not exceed 150 characters")
	    private String title;

	    private String content;
}
