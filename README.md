# Appointment API

A NestJS-based REST API for managing medical appointments, doctor schedules, and related healthcare operations.

## Features

- **User Management** - User registration, authentication with JWT
- **Role-Based Access Control** - Users, roles, and user-role assignments
- **Doctor Management** - Doctor profiles and working schedules
- **Appointment System** - Create and manage patient appointments
- **Room Management** - Medical facility room allocation
- **Member Management** - Patient/member registration and profiles
- **Items Management** - Medical equipment and resource tracking

## Technology Stack

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with Passport
- **Security**: bcrypt for password hashing
- **Testing**: Jest

## Project Setup

```bash
# Install dependencies
$ npm install

# Set up environment variables
$ cp .env.example .env
# Edit .env with your database and JWT configuration
```

## Database Configuration

The application uses PostgreSQL with the following default configuration:
- Host: localhost
- Port: 5432
- Database: postgres
- Schema: appointment

Update your `.env` file with your specific database credentials.

## Running the Application

```bash
# Development mode with hot reload
$ npm run start:dev

# Standard development mode
$ npm run start

# Production mode
$ npm run start:prod
```

The API will be available at `http://localhost:3000`

## Development Commands

```bash
# Format code with Prettier
$ npm run format

# Lint and fix code issues
$ npm run lint

# Build the application
$ npm run build
```

## Testing

```bash
# Run unit tests
$ npm run test

# Run tests in watch mode
$ npm run test:watch

# Run tests with coverage report
$ npm run test:cov

# Run end-to-end tests
$ npm run test:e2e

# Debug tests
$ npm run test:debug
```

## API Modules

- **Auth** - Authentication and authorization endpoints
- **Users** - User management and doctor profiles
- **Roles** - Role definitions and management
- **UserRoles** - User-role assignment operations
- **Members** - Patient/member management
- **DoctorSchedules** - Doctor availability and working hours
- **Appointments** - Appointment booking and management
- **Rooms** - Medical facility room management
- **Items** - Medical equipment and resource tracking

## Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=postgres
DB_SCHEMA=appointment

# JWT
JWT_SECRET=your-secret-key

# Application
NODE_ENV=development
PORT=3000
```

## License

This project is [UNLICENSED](LICENSE).