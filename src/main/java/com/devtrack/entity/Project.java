package com.devtrack.entity;

import java.util.ArrayList;
import java.util.List;

import com.devtrack.dto.response.ProjectResponse.ProjectResponseBuilder;
import com.devtrack.enums.ProjectStatus;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name= "projects")
public class Project {
	
	    @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    private Long id;

	    @Column(name = "title", nullable = false, length = 150)
	    private String title;

	    @Column(name = "description", columnDefinition = "TEXT")
	    private String description;

	    @Enumerated(EnumType.STRING)
	    @Column(name = "status", nullable = false)
	    private ProjectStatus status;

	    @ManyToOne(fetch = FetchType.LAZY)
	    @JoinColumn(name = "user_id", nullable = false)
	    private User user;

	    @OneToMany(mappedBy = "project",cascade = CascadeType.ALL,orphanRemoval = true)
	    private List<Milestone> milestones = new ArrayList<>();
	
}
