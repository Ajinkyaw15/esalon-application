# Ecozii E-Salon

Online salon booking platform — discover salons, view services, and book appointments.

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| Frontend | React 19, TypeScript, Vite, React Router, Axios |
| Backend | Spring Boot 3.2, Java 17, Spring Security, JWT |
| Database | MySQL |
| Cloud | AWS S3 (profile image storage) |

## Project Structure

```
ecozii/
├── e-salon/              # Spring Boot REST API (port 8080)
└── e-salon-frontend/     # React SPA (port 5173)
```

## Features

- User registration & login (JWT authentication)
- Browse salons (all, by city, nearby via GPS)
- Salon details with services and Google Maps links
- Appointment booking with 30-minute slot validation
- View and cancel bookings
- User profile management
- Profile image upload to AWS S3 (API ready)

## Prerequisites

- Java 17+
- Node.js 18+
- MySQL 8+
- Maven
- AWS credentials (optional, for profile image upload)

## Database Setup

```sql
CREATE DATABASE esalon_db;
```

Create tables matching JPA entities (`users`, `salons`, `services`, `appointments`) or set `spring.jpa.hibernate.ddl-auto=update` for development.

## Backend Setup

```bash
cd e-salon
# Set env vars: JWT_SECRET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY (optional)
mvn spring-boot:run
```

API runs at `http://localhost:8080`  
Swagger UI: `http://localhost:8080/swagger-ui.html`

## Frontend Setup

```bash
cd e-salon-frontend
npm install
npm run dev
```

App runs at `http://localhost:5173` (proxies `/api` → backend)

## API Overview

| Endpoint | Auth | Description |
|----------|------|-------------|
| `POST /api/auth/register` | Public | Register user |
| `POST /api/auth/login` | Public | Login |
| `GET /api/salons` | Public | List salons |
| `GET /api/maps/nearby` | Public | Nearby salons |
| `POST /api/appointments/book` | JWT | Book appointment |
| `GET /api/appointments/my` | JWT | My bookings |
| `GET /api/user/profile` | JWT | User profile |

## Author

Ajinkya — [GitHub](https://github.com/Ajinkyaw15)
