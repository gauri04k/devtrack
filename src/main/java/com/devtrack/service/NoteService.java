package com.devtrack.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.devtrack.dto.request.NoteRequest;
import com.devtrack.dto.response.NoteResponse;

public interface NoteService {
	
    NoteResponse createNote(Long userId, NoteRequest request);

    Page<NoteResponse> getAllNotes(Long userId, Pageable pageable);
    
    NoteResponse getNoteById(Long userId, Long noteId);
    NoteResponse updateNote(Long userId,Long noteId,NoteRequest request);

    void deleteNote(Long userId, Long noteId);

    Page<NoteResponse> searchNotes(Long userId,String keyword, Pageable pageable);
}
