package com.devtrack.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.devtrack.entity.Note;

public interface NoteRepository extends JpaRepository<Note, Long>{

    // get all notes of a particular user
    Page<Note> findByUserIdOrderByCreatedAtDesc(Long userId,Pageable pageable);

    // get a specific note belonging to a specific user
    Optional<Note> findByIdAndUserId(Long id,Long userId);

    // search note by content or title
    @Query("""
            SELECT n
            FROM Note n
            WHERE n.user.id = :userId
            AND (
                LOWER(n.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(n.content) LIKE LOWER(CONCAT('%', :keyword, '%'))
            )
            ORDER BY n.createdAt DESC
            """)
    
    Page<Note> searchNotes(@Param("userId") Long userId, @Param("keyword") String keyword,Pageable pageable);
}