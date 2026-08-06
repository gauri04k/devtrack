package com.devtrack.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.devtrack.entity.Note;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {

}
