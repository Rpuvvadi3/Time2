package com.example.demo.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@ActiveProfiles("test")
class JwtUtilTest {

    private JwtUtil jwtUtil;
    private final String testSecret = "testSecretKeyThatIsAtLeast256BitsLongForHS256Algorithm12345678";
    private final long testExpiration = 86400000; // 24 hours

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil(testSecret, testExpiration);
    }

    @Test
    @DisplayName("Generate token - Success")
    void generateToken_Success() {
        Long userId = 1L;
        String username = "testuser";

        String token = jwtUtil.generateToken(userId, username);

        assertNotNull(token);
        assertFalse(token.isEmpty());
    }

    @Test
    @DisplayName("Get username from token - Success")
    void getUsernameFromToken_Success() {
        Long userId = 1L;
        String username = "testuser";
        String token = jwtUtil.generateToken(userId, username);

        String extractedUsername = jwtUtil.getUsernameFromToken(token);

        assertEquals(username, extractedUsername);
    }

    @Test
    @DisplayName("Get userId from token - Success")
    void getUserIdFromToken_Success() {
        Long userId = 123L;
        String username = "testuser";
        String token = jwtUtil.generateToken(userId, username);

        Long extractedUserId = jwtUtil.getUserIdFromToken(token);

        assertEquals(userId, extractedUserId);
    }

    @Test
    @DisplayName("Validate token - Valid token")
    void validateToken_ValidToken() {
        String token = jwtUtil.generateToken(1L, "testuser");

        boolean isValid = jwtUtil.validateToken(token);

        assertTrue(isValid);
    }

    @Test
    @DisplayName("Validate token - Invalid token")
    void validateToken_InvalidToken() {
        boolean isValid = jwtUtil.validateToken("invalid.token.here");

        assertFalse(isValid);
    }

    @Test
    @DisplayName("Validate token - Null token")
    void validateToken_NullToken() {
        boolean isValid = jwtUtil.validateToken(null);

        assertFalse(isValid);
    }

    @Test
    @DisplayName("Validate token - Empty token")
    void validateToken_EmptyToken() {
        boolean isValid = jwtUtil.validateToken("");

        assertFalse(isValid);
    }

    @Test
    @DisplayName("Get expiration from token - Success")
    void getExpirationFromToken_Success() {
        String token = jwtUtil.generateToken(1L, "testuser");

        java.util.Date expiration = jwtUtil.getExpirationFromToken(token);

        assertNotNull(expiration);
        // Expiration should be in the future
        assertTrue(expiration.after(new java.util.Date()));
    }

    @Test
    @DisplayName("Token contains correct claims")
    void tokenContainsCorrectClaims() {
        Long userId = 42L;
        String username = "claimsuser";
        String token = jwtUtil.generateToken(userId, username);

        assertEquals(username, jwtUtil.getUsernameFromToken(token));
        assertEquals(userId, jwtUtil.getUserIdFromToken(token));
        assertTrue(jwtUtil.validateToken(token));
    }

    @Test
    @DisplayName("Expired token - Not valid")
    void expiredToken_NotValid() {
        // Create a JwtUtil with very short expiration
        JwtUtil shortExpirationJwtUtil = new JwtUtil(testSecret, 1); // 1 millisecond

        String token = shortExpirationJwtUtil.generateToken(1L, "testuser");

        // Wait for token to expire
        try {
            Thread.sleep(10);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        assertFalse(shortExpirationJwtUtil.validateToken(token));
    }
}

