package com.example.demo.controller;

import com.example.demo.dto.AuthResponseDTO;
import com.example.demo.dto.LoginRequestDTO;
import com.example.demo.dto.RegisterRequestDTO;
import com.example.demo.entity.User;
import com.example.demo.security.JwtUtil;
import com.example.demo.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class AuthController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Autowired
    public AuthController(UserService userService, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    /**
     * Login endpoint - authenticates user and returns JWT token
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO loginRequest) {
        System.out.println("Login attempt for username: " + loginRequest.getUsername());
        
        Optional<User> userOpt = userService.getUserByUsername(loginRequest.getUsername());
        
        if (userOpt.isEmpty()) {
            System.out.println("User not found: " + loginRequest.getUsername());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(AuthResponseDTO.error("Invalid username or password"));
        }

        User user = userOpt.get();
        System.out.println("User found: " + user.getUsername() + ", ID: " + user.getUserId());
        System.out.println("Stored password hash: " + user.getPasswordHash());
        System.out.println("Provided password: " + loginRequest.getPassword());
        
        boolean passwordMatches = passwordEncoder.matches(loginRequest.getPassword(), user.getPasswordHash());
        System.out.println("Password matches: " + passwordMatches);
        
        if (!passwordMatches) {
            // Try to generate a new hash and see if it matches
            String newHash = passwordEncoder.encode(loginRequest.getPassword());
            System.out.println("New hash for provided password: " + newHash);
            System.out.println("New hash matches provided password: " + passwordEncoder.matches(loginRequest.getPassword(), newHash));
            
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(AuthResponseDTO.error("Invalid username or password"));
        }

        String token = jwtUtil.generateToken(user.getUserId(), user.getUsername());
        System.out.println("Login successful, token generated");
        
        return ResponseEntity.ok(AuthResponseDTO.success(
                token,
                user.getUserId(),
                user.getUsername(),
                user.getEmail()
        ));
    }

    /**
     * Reset test user password - utility endpoint for development
     * This will reset the test user's password to "test" using the current BCrypt encoder
     */
    @PostMapping("/reset-test-user")
    public ResponseEntity<Map<String, String>> resetTestUser() {
        Optional<User> userOpt = userService.getUserByUsername("test");
        
        String newPasswordHash = passwordEncoder.encode("test");
        System.out.println("Generated new password hash for 'test': " + newPasswordHash);
        System.out.println("Verifying hash works: " + passwordEncoder.matches("test", newPasswordHash));
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            System.out.println("Found existing test user, updating password");
            System.out.println("Old hash: " + user.getPasswordHash());
            // Generate a fresh BCrypt hash for "test"
            user.setPasswordHash(newPasswordHash);
            User updated = userService.updateUser(user);
            System.out.println("New hash saved: " + updated.getPasswordHash());
            System.out.println("Verifying saved hash: " + passwordEncoder.matches("test", updated.getPasswordHash()));
            return ResponseEntity.ok(Map.of(
                "message", "Test user password reset successfully. Username: test, Password: test",
                "newHash", newPasswordHash,
                "verified", String.valueOf(passwordEncoder.matches("test", updated.getPasswordHash()))
            ));
        } else {
            // Create test user if it doesn't exist
            System.out.println("Test user not found, creating new one");
            User testUser = new User();
            testUser.setUsername("test");
            testUser.setEmail("test@example.com");
            testUser.setPasswordHash(newPasswordHash);
            testUser.setCreatedAt(LocalDateTime.now());
            User created = userService.createUser(testUser);
            System.out.println("Created test user with hash: " + created.getPasswordHash());
            System.out.println("Verifying created hash: " + passwordEncoder.matches("test", created.getPasswordHash()));
            return ResponseEntity.ok(Map.of(
                "message", "Test user created successfully. Username: test, Password: test",
                "newHash", newPasswordHash,
                "verified", String.valueOf(passwordEncoder.matches("test", created.getPasswordHash()))
            ));
        }
    }

    /**
     * Register endpoint - creates new user account
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody RegisterRequestDTO registerRequest) {
        try {
            System.out.println("Registration attempt for username: " + registerRequest.getUsername() + ", email: " + registerRequest.getEmail());
            
            // Check if username already exists
            if (userService.existsByUsername(registerRequest.getUsername())) {
                System.out.println("Username already exists: " + registerRequest.getUsername());
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(AuthResponseDTO.error("Username already exists"));
            }

            // Check if email already exists
            if (userService.existsByEmail(registerRequest.getEmail())) {
                System.out.println("Email already exists: " + registerRequest.getEmail());
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(AuthResponseDTO.error("Email already exists"));
            }

            // Create new user
            User user = new User();
            user.setUsername(registerRequest.getUsername());
            user.setEmail(registerRequest.getEmail());
            user.setPasswordHash(passwordEncoder.encode(registerRequest.getPassword()));
            user.setCreatedAt(LocalDateTime.now());
            
            System.out.println("Creating user with username: " + user.getUsername());

            User savedUser = userService.createUser(user);
            System.out.println("User created successfully with ID: " + savedUser.getUserId());

            // Generate token for immediate login
            String token = jwtUtil.generateToken(savedUser.getUserId(), savedUser.getUsername());
            System.out.println("Token generated successfully");
            
            AuthResponseDTO response = AuthResponseDTO.success(
                    token,
                    savedUser.getUserId(),
                    savedUser.getUsername(),
                    savedUser.getEmail()
            );
            response.setMessage("Registration successful");
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            System.err.println("Error during registration: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(AuthResponseDTO.error("Registration failed: " + e.getMessage()));
        }
    }

    /**
     * Validate token endpoint - checks if JWT token is valid
     */
    @GetMapping("/validate")
    public ResponseEntity<AuthResponseDTO> validateToken(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(AuthResponseDTO.error("No token provided"));
        }

        String token = authHeader.substring(7);
        
        if (!jwtUtil.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(AuthResponseDTO.error("Invalid or expired token"));
        }

        Long userId = jwtUtil.getUserIdFromToken(token);
        String username = jwtUtil.getUsernameFromToken(token);
        
        Optional<User> userOpt = userService.getUserById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(AuthResponseDTO.error("User not found"));
        }

        User user = userOpt.get();
        return ResponseEntity.ok(AuthResponseDTO.success(
                token,
                user.getUserId(),
                user.getUsername(),
                user.getEmail()
        ));
    }

    /**
     * Get current user info from token
     */
    @GetMapping("/me")
    public ResponseEntity<AuthResponseDTO> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        return validateToken(authHeader);
    }
}


