package com.devtrack.service.impl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devtrack.dto.request.DailyLogRequest;
import com.devtrack.dto.response.DailyLogResponse;
import com.devtrack.entity.DailyLog;
import com.devtrack.entity.Skill;
import com.devtrack.entity.User;
import com.devtrack.repository.DailyLogRepository;
import com.devtrack.repository.SkillRepository;
import com.devtrack.repository.UserRepository;
import com.devtrack.service.DailyLogService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class DailyLogServiceImpl implements DailyLogService {

    private final DailyLogRepository dailyLogRepository;
    private final UserRepository userRepository;
    private final SkillRepository skillRepository;


    // =========================================================
    // CREATE DAILY LOG
    // =========================================================
    @Override
    public DailyLogResponse createDailyLog(
            Long userId,
            DailyLogRequest request
    ) {

        User user = userRepository
                .findById(userId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found with id : " + userId
                        )
                );

        Skill skill = null;

        if (request.getSkillId() != null) {

            skill = skillRepository
                    .findById(request.getSkillId())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Skill not found with id : "
                                            + request.getSkillId()
                            )
                    );
        }

        DailyLog log = new DailyLog();

        log.setUser(user);
        log.setSkill(skill);
        log.setTopic(request.getTopic());
        log.setHours(request.getHours());
        log.setNotes(request.getNotes());
        log.setLogDate(request.getLogDate());

        DailyLog savedLog =
                dailyLogRepository.save(log);

        return mapToResponse(savedLog);
    }
    @Override
    @Transactional(readOnly = true)
    public List<DailyLogResponse> getAllDailyLogs(
            Long userId
    ) {

        return dailyLogRepository
                .findByUserIdOrderByLogDateDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }


    // =========================================================
    // GET DAILY LOG BY ID
    // =========================================================
    @Override
    @Transactional(readOnly = true)
    public DailyLogResponse getDailyLogById(
            Long userId,
            Long logId
    ) {

        DailyLog log = dailyLogRepository
                .findByIdAndUserId(logId, userId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Daily Log not found"
                        )
                );

        return mapToResponse(log);
    }
    @Override
    public DailyLogResponse updateDailyLog(
            Long userId,
            Long logId,
            DailyLogRequest request
    ) {

        DailyLog log = dailyLogRepository
                .findByIdAndUserId(logId, userId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Daily Log not found"
                        )
                );

        log.setTopic(request.getTopic());
        log.setHours(request.getHours());
        log.setNotes(request.getNotes());
        log.setLogDate(request.getLogDate());


        if (request.getSkillId() != null) {

            Skill skill = skillRepository
                    .findById(request.getSkillId())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Skill not found"
                            )
                    );

            log.setSkill(skill);

        } else {

            log.setSkill(null);
        }


        DailyLog updatedLog =
                dailyLogRepository.save(log);

        return mapToResponse(updatedLog);
    }

    @Override
    public void deleteDailyLog(
            Long userId,
            Long logId
    ) {

        DailyLog log = dailyLogRepository
                .findByIdAndUserId(logId, userId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Daily Log not found"
                        )
                );

        dailyLogRepository.delete(log);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DailyLogResponse> getLogsByDate(
            Long userId,
            LocalDate date
    ) {

        return dailyLogRepository
                .findByUserIdAndLogDate(
                        userId,
                        date
                )
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getWeeklyHours(
            Long userId
    ) {

        LocalDate endDate =
                LocalDate.now();

        LocalDate startDate =
                endDate.minusDays(6);

        BigDecimal total =
                dailyLogRepository.getWeeklyHours(
                        userId,
                        startDate,
                        endDate
                );

        return total == null
                ? BigDecimal.ZERO
                : total;
    }

    private DailyLogResponse mapToResponse(
            DailyLog log
    ) {

        DailyLogResponse response =
                new DailyLogResponse();

        response.setId(log.getId());

        response.setTopic(
                log.getTopic()
        );

        response.setHours(
                log.getHours()
        );

        response.setNotes(
                log.getNotes()
        );

        response.setLogDate(
                log.getLogDate()
        );

        response.setUserId(
                log.getUser().getId()
        );

        if (log.getSkill() != null) {

            response.setSkillId(
                    log.getSkill().getId()
            );

            response.setSkillName(
                    log.getSkill().getName()
            );

        } else {

            response.setSkillId(null);
            response.setSkillName(null);
        }


        return response;
    }
}