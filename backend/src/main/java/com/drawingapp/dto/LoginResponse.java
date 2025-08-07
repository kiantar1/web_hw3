package com.drawingapp.dto;

public class LoginResponse {
    private boolean success;
    private UserDto user;
    private String error;

    public LoginResponse() {
    }

    public LoginResponse(boolean success, UserDto user) {
        this.success = success;
        this.user = user;
    }

    public LoginResponse(boolean success, String error) {
        this.success = success;
        this.error = error;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public UserDto getUser() {
        return user;
    }

    public void setUser(UserDto user) {
        this.user = user;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }
}
