package com.devtrack.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DailyLogRequest {

    private Long skillId;

    @NotBlank(message = "Topic is required")
    private String topic;

    @NotNull(message = "Hours is required")
    @Positive(message = "Hours must be greater than 0")
    private BigDecimal hours;
    private String notes;

    @NotNull(message = "Log date is required")
    private LocalDate logDate;
}