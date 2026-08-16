package com.devtrack.service.impl;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devtrack.dto.request.NoteRequest;
import com.devtrack.dto.response.NoteResponse;
import com.devtrack.entity.Note;
import com.devtrack.entity.User;
import com.devtrack.exception.ResourceNotFoundException;
import com.devtrack.repository.NoteRepository;
import com.devtrack.repository.UserRepository;
import com.devtrack.service.NoteService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class NoteServiceImpl implements NoteService {

    private final NoteRepository noteRepository;
    private final UserRepository userRepository;

    @Override
    public NoteResponse createNote(Long userId,NoteRequest request) {

        User user = userRepository.findById(userId).orElseThrow(() ->new ResourceNotFoundException(
                                "User not found with id : " + userId
                        ));

        Note note = new Note();

        note.setUser(user);
        note.setTitle(request.getTitle());
        note.setContent(request.getContent());
        note.setCreatedAt(LocalDateTime.now());

        Note savedNote = noteRepository.save(note);

        return mapToResponse(savedNote);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NoteResponse> getAllNotes(Long userId,Pageable pageable) {

        userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException(
                                "User not found with id : " + userId
                        ));

        return noteRepository.findByUserIdOrderByCreatedAtDesc(userId,pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public NoteResponse getNoteById(Long userId,Long noteId) {

        Note note = noteRepository.findByIdAndUserId(noteId, userId).orElseThrow(() -> new ResourceNotFoundException(
                                "Note not found with id : " + noteId
                        ));

        return mapToResponse(note);
    }

    @Override
    public NoteResponse updateNote(Long userId,Long noteId,NoteRequest request) {

        Note note = noteRepository.findByIdAndUserId(noteId, userId).orElseThrow(() ->
                        new ResourceNotFoundException("Note not found with id : " + noteId));

        note.setTitle(request.getTitle());
        note.setContent(request.getContent());

        Note updatedNote = noteRepository.save(note);

        return mapToResponse(updatedNote);
    }

    @Override
    public void deleteNote(Long userId,Long noteId) {

        Note note = noteRepository.findByIdAndUserId(noteId, userId).orElseThrow(() -> new ResourceNotFoundException(
                                "Note not found with id : " + noteId
                        ));

        noteRepository.delete(note);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NoteResponse> searchNotes(Long userId,String keyword,Pageable pageable) {

        userRepository.findById(userId).orElseThrow(() ->new ResourceNotFoundException(
                                "User not found with id : " + userId
                        ));

        return noteRepository.searchNotes(userId,keyword,pageable).map(this::mapToResponse);
    }

    private NoteResponse mapToResponse(Note note) {
        return NoteResponse.builder()
                .id(note.getId())
                .userId(note.getUser().getId())
                .title(note.getTitle())
                .content(note.getContent())
                .createdAt(note.getCreatedAt())
                .build();
    }
}