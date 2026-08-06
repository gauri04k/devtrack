package com.devtrack.entity;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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



@Entity
@Table(name= "daily_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DailyLog {
	
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(nullable= false, length=255)
    private String topic;
	
	@Column(nullable = false, precision = 3, scale = 1)
	private BigDecimal hours;
	
	@Column(columnDefinition = "TEXT")
	private String notes;
	
	
	@Column(name = "log_date", nullable = false)
	private LocalDate logDate;
	
	
	@ManyToOne
	@JoinColumn(name="user_id" , nullable= false)
	private User user;
	
	@ManyToOne
	@JoinColumn(name = "skill_id")
	private Skill skill;
}
