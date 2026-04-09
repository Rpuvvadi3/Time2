package com.example.demo.config;

import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.Environment;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

/**
 * Automatically creates the database if it doesn't exist.
 * This runs BEFORE Spring Boot tries to connect to the database.
 */
public class DatabaseInitializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        Environment env = applicationContext.getEnvironment();
        
        String datasourceUrl = env.getProperty("spring.datasource.url", 
            "jdbc:postgresql://localhost:5432/checklist");
        String username = env.getProperty("spring.datasource.username", "postgres");
        String password = env.getProperty("spring.datasource.password", "postgres");
        
        createDatabaseIfNotExists(datasourceUrl, username, password);
    }
    
    private void createDatabaseIfNotExists(String datasourceUrl, String username, String password) {
        // Extract database name from URL (e.g., jdbc:postgresql://host:port/dbname)
        String dbName = extractDatabaseName(datasourceUrl);
        if (dbName == null) {
            System.out.println("[DatabaseInitializer] Could not extract database name from URL: " + datasourceUrl);
            return;
        }

        // Connect to default 'postgres' database to create our database
        String defaultUrl = datasourceUrl.replace("/" + dbName, "/postgres");
        
        System.out.println("[DatabaseInitializer] Attempting to create database '" + dbName + "' if it doesn't exist...");
        System.out.println("[DatabaseInitializer] Connecting to: " + defaultUrl.replace(password, "***"));
        
        try (Connection conn = DriverManager.getConnection(defaultUrl, username, password);
             Statement stmt = conn.createStatement()) {
            
            // Check if database exists
            String checkDb = "SELECT 1 FROM pg_database WHERE datname = '" + dbName + "'";
            boolean exists = stmt.executeQuery(checkDb).next();
            
            if (!exists) {
                System.out.println("[DatabaseInitializer] Database '" + dbName + "' does not exist. Creating it...");
                // Create database (cannot use parameters, so we sanitize the name)
                String createDb = "CREATE DATABASE " + sanitizeIdentifier(dbName);
                stmt.executeUpdate(createDb);
                System.out.println("[DatabaseInitializer] ✓ Database '" + dbName + "' created successfully!");
            } else {
                System.out.println("[DatabaseInitializer] ✓ Database '" + dbName + "' already exists.");
            }
        } catch (Exception e) {
            // If we can't connect to postgres database, assume database already exists or will be created manually
            System.out.println("[DatabaseInitializer] ⚠ Could not auto-create database: " + e.getMessage());
            System.out.println("[DatabaseInitializer] This is OK if the database already exists or will be created manually.");
            // Don't throw - allow application to continue
        }
    }

    private String extractDatabaseName(String url) {
        // Extract database name from jdbc:postgresql://host:port/dbname
        int lastSlash = url.lastIndexOf('/');
        if (lastSlash == -1) return null;
        
        String dbPart = url.substring(lastSlash + 1);
        // Remove query parameters if any
        int questionMark = dbPart.indexOf('?');
        if (questionMark != -1) {
            dbPart = dbPart.substring(0, questionMark);
        }
        return dbPart.trim();
    }

    private String sanitizeIdentifier(String identifier) {
        // PostgreSQL identifiers should be quoted if they contain special characters
        // For safety, we'll quote it
        return "\"" + identifier.replace("\"", "\"\"") + "\"";
    }
}


