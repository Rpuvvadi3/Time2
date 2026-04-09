package com.example.demo.dto;

public class AuthResponseDTO {
    
    private String token;
    private String type = "Bearer";
    private Long userId;
    private String username;
    private String email;
    private String message;

    public AuthResponseDTO() {}

    public AuthResponseDTO(String token, Long userId, String username, String email) {
        this.token = token;
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.message = "Login successful";
    }

    public static AuthResponseDTO success(String token, Long userId, String username, String email) {
        return new AuthResponseDTO(token, userId, username, email);
    }

    public static AuthResponseDTO error(String message) {
        AuthResponseDTO response = new AuthResponseDTO();
        response.setMessage(message);
        return response;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}

