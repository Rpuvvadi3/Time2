package com.example.demo.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;

@Configuration
public class EnvConfig {

    @PostConstruct
    public void loadEnv() {
        try {
            // Load .env file from the backend directory (where pom.xml is)
            Dotenv dotenv = Dotenv.configure()
                    .directory("./")  // Look in the backend directory
                    .ignoreIfMissing() // Don't fail if .env doesn't exist
                    .load();
            
            // Set system properties from .env file (Spring Boot reads these)
            dotenv.entries().forEach(entry -> {
                String key = entry.getKey();
                String value = entry.getValue();
                // Only set if not already set as environment variable
                if (System.getenv(key) == null && System.getProperty(key) == null) {
                    System.setProperty(key, value);
                }
            });
        } catch (Exception e) {
            // Silently fail if .env file doesn't exist or can't be loaded
            System.out.println("Note: .env file not found or couldn't be loaded. Using environment variables instead.");
        }
    }
}

