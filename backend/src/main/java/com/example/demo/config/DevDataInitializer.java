package com.example.demo.config;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

@Configuration
public class DevDataInitializer {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Always ensure test user exists with correct password
            Optional<User> testUserOpt = userRepository.findByUsername("test");
            if (testUserOpt.isPresent()) {
                // Update existing test user's password
                User testUser = testUserOpt.get();
                testUser.setPasswordHash(passwordEncoder.encode("test"));
                userRepository.save(testUser);
                System.out.println("=== Test user password updated ===");
                System.out.println("Test user: username='test', password='test'");
            } else {
                // Create test user if it doesn't exist
                User testUser = new User();
                testUser.setUsername("test");
                testUser.setEmail("test@example.com");
                testUser.setPasswordHash(passwordEncoder.encode("test"));
                userRepository.save(testUser);
                System.out.println("=== Test user created ===");
                System.out.println("Test user: username='test', password='test'");
            }
            
            // Only create other users if database is empty
            if (userRepository.count() <= 1) {
                // Create additional users
                if (!userRepository.existsByUsername("john_doe")) {
                    User johnDoe = new User();
                    johnDoe.setUsername("john_doe");
                    johnDoe.setEmail("john@example.com");
                    johnDoe.setPasswordHash(passwordEncoder.encode("password"));
                    userRepository.save(johnDoe);
                }
            }
        };
    }
}


