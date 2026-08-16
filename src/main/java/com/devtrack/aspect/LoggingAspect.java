package com.devtrack.aspect;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class LoggingAspect {
    private static final Logger logger = LoggerFactory.getLogger(LoggingAspect.class);
    /**
     * Logs every method inside the service layer.
     *
     * Logs:
     * 1. Service class and method name
     * 2. Execution time
     * 3. Successful completion
     * 4. Exceptions
     */
    @Around("execution(* com.devtrack.service..*(..))")
    public Object logServiceMethod(ProceedingJoinPoint joinPoint)throws Throwable {

        String className = joinPoint.getTarget().getClass().getSimpleName();
        String methodName = joinPoint.getSignature().getName();

        long startTime = System.currentTimeMillis();

        logger.info(
                "START: {}.{}()",
                className,
                methodName
        );

        try {
            Object result = joinPoint.proceed();
            long executionTime = System.currentTimeMillis() - startTime;

            logger.info(
                    "END: {}.{}() - Execution time: {} ms",
                    className,
                    methodName,
                    executionTime
            );
            return result;

        } catch (Throwable exception) {
            long executionTime = System.currentTimeMillis() - startTime;
            logger.error(
                    "ERROR: {}.{}() - Execution time: {} ms - Exception: {}",
                    className,
                    methodName,
                    executionTime,
                    exception.getClass().getSimpleName()
            );
            throw exception;
        }
    }
}