package com.devtrack.repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.devtrack.entity.DailyLog;

public interface DailyLogRepository extends JpaRepository<DailyLog, Long> {

      List<DailyLog> findByUserIdOrderByLogDateDesc(Long userId);
      Optional<DailyLog> findByIdAndUserId(Long id, Long userId);
      List<DailyLog> findByUserIdAndLogDate(Long userId, LocalDate logDate);

       @Query("""
            SELECT COALESCE(SUM(d.hours),0)
            FROM DailyLog d
            WHERE d.user.id = :userId
            AND d.logDate BETWEEN :startDate AND :endDate
            """)
    
    BigDecimal getWeeklyHours(
    		@Param("userId") Long userId,
    		@Param("startDate") LocalDate startDate,
    		@Param("endDate") LocalDate endDate);
       
       List<DailyLog> findTop5ByUserIdOrderByLogDateDescIdDesc(Long userId);
}