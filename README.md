# Bus Booking System

A full-stack bus booking application with user authentication built using React (Frontend) and Spring Boot (Backend).

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **Java** (JDK 17 or higher)
- **Maven** (3.6 or higher)
- **PostgreSQL** (12 or higher)

## 📦 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd bus-booking-system
```

### 2. Backend Setup

#### Create PostgreSQL Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE busbooking;

# Exit PostgreSQL
\q
```

#### Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=busbooking
DB_USER=postgres
DB_PASSWORD=your_password
DB_SSL=disable

JWT_SECRET=your_super_secret_jwt_key_here_minimum_256_bits
JWT_EXPIRATION=86400000

CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

#### Install Dependencies & Run

```bash
# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

Backend will run on: **http://localhost:8080**

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on: **http://localhost:5173**

## 🧪 Testing

### Test Backend API

Visit Swagger UI: **http://localhost:8080/swagger-ui.html**

Or use cURL:

```bash
curl -X POST http://localhost:8080/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password@123"
  }'
```

### Test Frontend

1. Open **http://localhost:5173** in your browser
2. Navigate to the registration page
3. Register a new user with:
   - Valid email format
   - Password with at least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character

## 📁 Project Structure

```
bus-booking-system/
├── backend/                 # Spring Boot backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/       # Java source files
│   │   │   └── resources/  # Configuration & migrations
│   │   └── test/           # Test files
│   ├── .env                # Environment variables (create this)
│   ├── .env.example        # Environment template
│   └── pom.xml             # Maven dependencies
│
└── frontend/               # React frontend
    ├── src/
    │   ├── components/     # React components
    │   ├── contexts/       # Context providers
    │   ├── pages/          # Page components
    │   └── App.tsx         # Main app component
    ├── package.json        # NPM dependencies
    └── vite.config.ts      # Vite configuration
```

## 🔑 Features

- ✅ User Registration with validation
- ✅ Email uniqueness checking
- ✅ Password strength validation
- ✅ BCrypt password hashing
- ✅ Error handling with meaningful messages
- ✅ CORS enabled for frontend
- ✅ Swagger API documentation
- ✅ Database migrations with Flyway

## 🛠️ Technology Stack

### Backend

- Spring Boot 3.5.7
- Spring Security
- Spring Data JPA
- PostgreSQL
- Flyway
- JWT
- Lombok
- SpringDoc OpenAPI (Swagger)

### Frontend

- React 18
- TypeScript
- Vite
- Axios
- React Router
- Tailwind CSS (if applicable)

## 📝 API Endpoints

### User Registration

- **POST** `/user/register`
  - Request Body:
    ```json
    {
      "email": "user@example.com",
      "password": "Password@123"
    }
    ```
  - Response (201 Created):
    ```json
    {
      "id": 1,
      "email": "user@example.com",
      "createdAt": "2025-11-09T20:55:12",
      "message": "User registered successfully"
    }
    ```

## 🐛 Troubleshooting

### Backend Issues

**Port 8080 already in use:**

```bash
# Find and kill process using port 8080
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8080 | xargs kill -9
```

**Database connection failed:**

- Verify PostgreSQL is running
- Check `.env` credentials
- Ensure database `busbooking` exists

**Flyway migration errors:**

```bash
# Reset database
DROP DATABASE busbooking;
CREATE DATABASE busbooking;
```

### Frontend Issues

**Port 5173 already in use:**

- Vite will automatically use the next available port
- Or stop the process using port 5173

**API connection refused:**

- Ensure backend is running on port 8080
- Check CORS configuration in `SecurityConfig.java`

## 📧 Sample Test Users

Three test users are pre-populated (password: `Password@123`):

- test1@example.com
- test2@example.com
- admin@example.com
