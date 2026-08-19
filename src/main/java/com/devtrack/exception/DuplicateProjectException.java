package com.devtrack.exception;

public class DuplicateProjectException extends RuntimeException {

    public DuplicateProjectException(String message) {
        super(message);
    }
}