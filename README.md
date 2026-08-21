# DevTrack

DevTrack is a full-stack personal developer progress tracker. It combines a Spring Boot REST API with a React dashboard for managing skills, projects, milestones, daily logs, notes, and learning progress.

## Features

- Register and sign in with JWT authentication
- Dashboard with skill progress, active projects, weekly hours, and recent activity
- Create, update, filter, and delete projects
- Track project milestones and due dates
- Manage skills, statuses, and target dates
- Record daily work or study logs and view weekly summaries
- Create and search personal notes
- Explore the API through Swagger UI

## Technology

### Backend

- Java 17
- Spring Boot 4.1.0
- Spring MVC, Spring Data JPA, and Hibernate
- Spring Security with JWT
- MySQL
- Maven and Lombok
- Springdoc OpenAPI

### Frontend

- React 19
- Vite
- React Router
- React Bootstrap and Bootstrap
- Axios
- Chart.js and React Icons

## Project Structure

```text
devtrack/
├── src/                         # Spring Boot backend
│   ├── main/java/com/devtrack/
│   │   ├── controller/          # REST endpoints
│   │   ├── service/             # Business logic
│   │   ├── repository/          # Database access
│   │   ├── entity/              # JPA entities
│   │   ├── dto/                 # Request and response objects
│   │   ├── security/            # JWT and security configuration
│   │   └── exception/           # Centralized error handling
│   └── main/resources/
│       └── application.properties
├── frontend/                    # React/Vite frontend
│   └── src/
│       ├── pages/               # Login, dashboard, projects, skills, logs, notes
│       ├── services/             # API clients
│       ├── components/           # Shared UI components
│       └── routes/               # Public and protected routes
└── pom.xml
```

## Prerequisites

- JDK 17 or newer
- MySQL Server
- Node.js 18 or newer and npm

The backend currently connects to MySQL on port `3307` using database `devtrack_db`, username `root`, and password `root`. Create the database first if your MySQL setup does not allow automatic database creation, or update `src/main/resources/application.properties` for your local credentials.

## Run Locally

### 1. Start the backend

From the repository root:

```bash
./mvnw spring-boot:run
```

On Windows:

```powershell
mvnw.cmd spring-boot:run
```

The API starts at `http://localhost:8080`.

### 2. Configure and start the frontend

Open a second terminal in `frontend/`. Set the API URL before starting Vite. PowerShell:

```powershell
cd frontend
$env:VITE_API_BASE_URL="http://localhost:8080"
npm install
npm run dev
```

Bash:

```bash
cd frontend
export VITE_API_BASE_URL=http://localhost:8080
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`. Register a user, then sign in to access the protected pages.

For a persistent frontend configuration, create `frontend/.env.local`:

```env
VITE_API_BASE_URL=http://localhost:8080
```

Do not commit environment files containing secrets.

## Frontend Routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/login` | Public | Sign in |
| `/register` | Public | Create an account |
| `/dashboard` | Protected | View progress and activity |
| `/skills` | Protected | Manage skills |
| `/projects` | Protected | Manage projects |
| `/projects/:projectId/milestones` | Protected | Manage project milestones |
| `/daily-logs` | Protected | Manage daily logs |
| `/notes` | Protected | Manage and search notes |

## API Documentation

- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

Core API groups include `/api/auth`, `/api/users/{userId}/projects`, `/api/users/{userId}/skills`, `/api/users/{userId}/logs`, `/api/users/{userId}/notes`, `/api/projects/{projectId}/milestones`, and `/api/users/{userId}/dashboard`.

## Development Commands

Backend tests from the repository root:

```bash
./mvnw test
```

Frontend commands from `frontend/`:

```bash
npm run dev      # Start Vite development server
npm run build    # Create a production build
npm run lint     # Run ESLint
npm run preview  # Preview the production build
```

## Configuration Notes

- Backend configuration lives in `src/main/resources/application.properties`.
- The frontend reads the backend URL from `VITE_API_BASE_URL`.
- The frontend stores the current authentication response in browser local storage under `devtrack_auth`.
- Change the default JWT secret and database credentials before deploying outside local development.

## Author

Gauri Kapadnis