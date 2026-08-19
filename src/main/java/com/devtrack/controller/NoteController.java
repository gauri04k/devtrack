package com.devtrack.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.devtrack.dto.request.NoteRequest;
import com.devtrack.dto.response.NoteResponse;
import com.devtrack.service.NoteService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users/{userId}/notes")
@RequiredArgsConstructor
@Validated
public class NoteController {

    private final NoteService noteService;
    @PostMapping
    public ResponseEntity<NoteResponse> createNote(
            @PathVariable Long userId,
            @Valid @RequestBody NoteRequest request) {

        NoteResponse response = noteService.createNote(userId, request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<NoteResponse>> searchNotes(
            @PathVariable Long userId,
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);

        Page<NoteResponse> response = noteService.searchNotes(userId,keyword,pageable);

        return ResponseEntity.ok(response);
    }


    @GetMapping
    public ResponseEntity<Page<NoteResponse>> getAllNotes(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);

        Page<NoteResponse> response = noteService.getAllNotes(userId,pageable);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{noteId}")
    public ResponseEntity<NoteResponse> getNoteById(@PathVariable Long userId,@PathVariable Long noteId) {

        NoteResponse response = noteService.getNoteById(userId,noteId);

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{noteId}")
    public ResponseEntity<NoteResponse> updateNote(
            @PathVariable Long userId,
            @PathVariable Long noteId,
            @Valid @RequestBody NoteRequest request) {

        NoteResponse response = noteService.updateNote(userId,noteId,request);

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{noteId}")
    public ResponseEntity<Void> deleteNote(@PathVariable Long userId,@PathVariable Long noteId) {

        noteService.deleteNote(userId,noteId);

        return ResponseEntity.noContent().build();
    }
}