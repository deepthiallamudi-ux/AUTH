# Secure TODO Application - Setup Guide

A production-ready TODO application built with Node.js, Express, Supabase, and JWT authentication.

## Features ✨

- 🔐 **JWT-based Authentication** - Secure token-based authorization
- 👤 **User Authentication** - Signup & Login with bcrypt password hashing
- 📝 **Protected Todo Routes** - User-specific TODO management
- 🛡️ **Authorization Middleware** - Validates JWT tokens on protected routes
- 🗄️ **Supabase Integration** - Cloud database with PostgreSQL
- 📊 **User Isolation** - Users can only access/modify their own todos
- ⚡ **Error Handling** - Centralized error handling with proper HTTP status codes
- 🎯 **Clean Architecture** - Separated concerns with controllers, routes, middleware

## Project Structure

```
AUTH/
├── src/
│   ├── config/
│   │   └── supabase.js          # Supabase client configuration
│   ├── middleware/
│   │   └── auth.middleware.js   # JWT verification middleware
│   ├── routes/
│   │   ├── auth.routes.js       # Authentication routes
│   │   └── todo.routes.js       # Protected todo routes
│   ├── controllers/
│   │   ├── auth.controller.js   # Authentication logic
│   │   └── todo.controller.js   # Todo CRUD logic
│   └── app.js                    # Express app configuration
├── server.js                     # Server entry point
├── .env                          # Environment variables (not in git)
├── .gitignore                    # Git ignore file
├── package.json                  # Dependencies
└── README.md                     # Documentation
```

## Prerequisites

- Node.js (v14+)
- npm or yarn
- Supabase account (free tier available at https://supabase.com)

## Installation

### 1. Install Dependencies

```bash
npm install
```

This will install:
- `express` - Web framework
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT handling
- `@supabase/supabase-js` - Supabase client
- `dotenv` - Environment variables
- `nodemon` - Development hot-reload

### 2. Supabase Setup

#### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up and create a new project
3. Wait for the project to be provisioned

#### Run SQL Migrations

In the Supabase SQL Editor, run these queries:

```sql
-- Create users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create todos table
CREATE TABLE todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_users_email ON users(email);
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=7000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345678
JWT_EXPIRY=1h

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Where to find these values:**
- `SUPABASE_URL`: Project settings → API → Project URL
- `SUPABASE_ANON_KEY`: Project settings → API → anon (public) key
- `SUPABASE_SERVICE_ROLE_KEY`: Project settings → API → service_role key

## Running the Application

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:7000`

## API Endpoints

### Authentication Routes

#### 1. Sign Up
```http
POST /auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

#### 2. Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "name": "John Doe",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Protected Todo Routes

**All TODO endpoints require JWT token in Authorization header:**
```http
Authorization: Bearer <your_jwt_token>
```

#### 3. Create Todo
```http
POST /todos
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "title": "Buy groceries"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Todo created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "title": "Buy groceries",
    "completed": false,
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2024-02-03T10:30:00Z"
  }
}
```

#### 4. Get All Todos
```http
GET /todos
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Todos retrieved successfully",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "title": "Buy groceries",
      "completed": false,
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "created_at": "2024-02-03T10:30:00Z"
    }
  ],
  "count": 1
}
```

#### 5. Update Todo
```http
PUT /todos/:id
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "title": "Buy groceries and cook",
  "completed": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Todo updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "title": "Buy groceries and cook",
    "completed": true,
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2024-02-03T10:30:00Z"
  }
}
```

#### 6. Delete Todo
```http
DELETE /todos/:id
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Todo deleted successfully"
}
```

## Security Features

### 1. Password Security
- Passwords are hashed using bcrypt with 10 salt rounds
- Never stored in plain text
- Validated on login using bcrypt.compare()

### 2. JWT Authentication
- 1-hour token expiry
- Secure secret key stored in environment variables
- Token verification on all protected routes
- Clear error messages for expired/invalid tokens

### 3. User Isolation
- Each todo is tied to a user_id via foreign key
- Ownership validation on update/delete operations
- 403 Forbidden response for unauthorized access
- Users cannot access other users' todos

### 4. Error Handling
- Proper HTTP status codes
- Meaningful error messages
- No sensitive information in error responses
- Input validation on all endpoints

### 5. Database Security
- Foreign key constraints prevent orphaned todos
- ON DELETE CASCADE removes todos when user is deleted
- Indexed columns for performance

## Error Responses

### Unauthorized (401)
```json
{
  "success": false,
  "message": "No authorization token provided"
}
```

### Forbidden (403)
```json
{
  "success": false,
  "message": "You do not have permission to update this todo"
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Todo not found"
}
```

### Bad Request (400)
```json
{
  "success": false,
  "message": "Email and password are required"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Best Practices Implemented

✅ **Separation of Concerns** - Controllers, routes, middleware, config separated  
✅ **Environment Variables** - Sensitive data in .env file  
✅ **Error Handling** - Centralized error handling middleware  
✅ **Input Validation** - Validates all user inputs  
✅ **Security** - bcrypt hashing, JWT verification, user isolation  
✅ **Status Codes** - Proper HTTP status codes for all responses  
✅ **Consistent Response Format** - All responses follow same structure  
✅ **Logging** - Basic request logging for debugging  
✅ **Code Comments** - Well-documented code with JSDoc  
✅ **Graceful Shutdown** - Proper server shutdown handling  

## Testing the API

### Using Postman or cURL

1. **Sign Up:**
```bash
curl -X POST http://localhost:7000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"password123"}'
```

2. **Login:**
```bash
curl -X POST http://localhost:7000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"password123"}'
```

3. **Create Todo (use token from login response):**
```bash
curl -X POST http://localhost:7000/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"title":"Learn Node.js"}'
```

4. **Get Todos:**
```bash
curl -X GET http://localhost:7000/todos \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Deployment Considerations

1. **Change JWT_SECRET** - Use a strong, random secret in production
2. **Update NODE_ENV** - Set to "production"
3. **Enable HTTPS** - Always use HTTPS in production
4. **Rate Limiting** - Add rate limiting for auth endpoints
5. **CORS** - Configure CORS for your frontend domain
6. **Database Backups** - Enable automatic backups in Supabase
7. **Monitoring** - Set up error tracking (e.g., Sentry)
8. **Logging** - Implement structured logging

## Troubleshooting

### "Cannot find module" errors
```bash
npm install
```

### JWT verification errors
- Ensure token is sent in format: `Authorization: Bearer <token>`
- Check token hasn't expired
- Verify JWT_SECRET matches the one used to create the token

### Database connection errors
- Verify SUPABASE_URL and SUPABASE_ANON_KEY in .env
- Ensure Supabase project is running
- Check network connectivity

### Password mismatch errors
- Ensure password is at least 6 characters
- Verify email exists in database

## License

ISC

## Author

Your Name Here
