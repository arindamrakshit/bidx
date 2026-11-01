package com.bidx.exception;

public class BidConflictException extends RuntimeException {
    public BidConflictException(String message) {
        super(message);
    }
}
