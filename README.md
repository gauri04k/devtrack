# DevTrack

DevTrack is a Spring Boot-based personal developer progress tracker designed to help individuals manage their learning journey, projects, skills, and daily work logs in one place.

## Overview

The application provides a simple API for tracking:

- Users and account management
- Projects with status tracking
- Skills with target dates and statuses
- Daily logs for work, study, or development activities
- Milestones for project progress tracking
- Weekly summary of logged hours

It follows a clean RESTful structure with DTOs, validation, and centralized exception handling.

## Tech Stack

- Java 17
- Spring Boot 4.1.0
- Spring MVC
- Spring Data JPA
- Hibernate
- MySQL
- Maven
- Lombok
- Spring Validation
- Springdoc OpenAPI / Swagger UI

## Main Features

### User Management
- Create, read, update, and delete users
- Email validation and password length checks

### Project Management
- Create projects for a specific user
- Retrieve all projects or a single project by ID
- Update or delete projects
- Filter projects by status

### Skill Management
- Add skills with name, status, and target date
- Retrieve skills by user
- Update or delete skill entries
- Filter skills by status

### Daily Logs
- Record daily work logs with topic, hours, notes, and date
- Retrieve logs by user or by specific date
- Get a weekly summary of logged hours

### Milestones
- Create and manage milestones for projects
- Track milestone status and due dates

## API Documentation

Swagger UI is available at:

- http://localhost:8080/swagger-ui/index.html

OpenAPI JSON is available at:

- http://localhost:8080/v3/api-docs

## Project Structure

The application is organized into the following main packages:

- controller: REST API endpoints
- service: business logic
- repository: database access
- entity: JPA entities
- dto: request and response objects
- exception: centralized exception handling
- enums: status definitions

## Prerequisites

Before running the project, make sure you have:

- JDK 17 or newer
- Maven 3.8+
- MySQL server running
- A database named devtrack_db

## Configuration

Database settings are defined in src/main/resources/application.properties.

Make sure to set the database password environment variable:

- DB_PASSWORD

Example configuration:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/devtrack_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=Asia/Kolkata
spring.datasource.username=root
spring.datasource.password=${DB_PASSWORD}
```

## Running the Application

From the project root, run:

```bash
./mvnw spring-boot:run
```

On Windows:

```bash
mvnw.cmd spring-boot:run
```

The application will start on:

- http://localhost:8080

## Running Tests

```bash
./mvnw test
```

## Sample API Endpoints

- POST /api/users
- GET /api/users
- GET /api/users/{id}
- POST /api/users/{userId}/projects
- GET /api/users/{userId}/skills
- POST /api/users/{userId}/logs
- GET /api/users/{userId}/logs/weekly-summary

## Notes

The project includes:

- Request validation
- DTO-based API design
- Global exception handling
- Swagger documentation for easier API exploration

## Future Enhancements

Possible improvements for later versions include:

- Authentication and authorization
- Dashboard analytics
- Advanced reporting
- Role-based access control
- Frontend UI integration

## Author

Gauri Kapadnis