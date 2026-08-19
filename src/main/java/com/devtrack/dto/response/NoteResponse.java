package com.devtrack.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NoteResponse {
	    private Long id;
	    private Long userId;
	    private String title;
	    private String content;
	    private LocalDateTime createdAt;
}
