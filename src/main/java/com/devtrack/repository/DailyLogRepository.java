package com.devtrack.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.devtrack.entity.DailyLog;

@Repository
public interface DailyLogRepository extends JpaRepository<DailyLog, Long>{

}
