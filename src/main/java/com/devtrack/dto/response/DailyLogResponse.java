package com.devtrack.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyLogResponse {
    private Long id;
    private Long userId;
    private Long skillId;
    private String skillName;
    private String topic;
    private BigDecimal hours;
    private String notes;
    private LocalDate logDate;
}