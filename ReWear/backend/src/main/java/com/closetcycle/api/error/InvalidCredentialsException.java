package com.closetcycle.api.error;
public class InvalidCredentialsException extends RuntimeException { public InvalidCredentialsException() { super("Email or password is incorrect."); } }
