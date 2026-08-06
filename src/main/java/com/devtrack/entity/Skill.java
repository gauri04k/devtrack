package com.devtrack.entity;

import java.time.LocalDate;

import com.devtrack.enums.SkillStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name="skills")
public class Skill {
	
	
	@Id
	@GeneratedValue(strategy =  GenerationType.IDENTITY)
	private Long id;
	
	@Column(nullable=false, length=100)
	private String name;
	
	
	@Enumerated(EnumType.STRING)
	@Column(nullable=false)
	private SkillStatus status;
	
	@Column(name ="target_date")
	private LocalDate targetDate;
	
	@ManyToOne
	@JoinColumn(name = "user_id",nullable =false)
	private User user;
	
	

}
