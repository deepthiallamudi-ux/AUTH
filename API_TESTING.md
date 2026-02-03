# API Testing Guide

Complete guide to test all endpoints of the Secure TODO Application.

## Quick Start

### 1. Start the Server
```bash
npm run dev
```

Server will be running at: `http://localhost:7000`

### 2. Test Health Endpoint
```bash
curl http://localhost:7000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-02-03T10:30:00.000Z"
}
```

## Authentication Tests

### Test 1: Sign Up

**Endpoint:** `POST /auth/signup`

**Valid Request:**
```bash
curl -X POST http://localhost:7000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

**Expected Response (201):**
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

**Test Error Cases:**

Missing fields:
```bash
curl -X POST http://localhost:7000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```
Expected: `400 Bad Request` - "Name, email, and password are required"

Weak password (less than 6 characters):
```bash
curl -X POST http://localhost:7000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "123"
  }'
```
Expected: `400 Bad Request` - "Password must be at least 6 characters long"

Duplicate email:
```bash
curl -X POST http://localhost:7000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Another User",
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```
Expected: `400 Bad Request` - "User with this email already exists"

---

### Test 2: Login

**Endpoint:** `POST /auth/login`

**Valid Request:**
```bash
curl -X POST http://localhost:7000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "name": "John Doe",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20iLCJpYXQiOjE3MDczMTQyMDAsImV4cCI6MTcwNzMxNzgwMH0.SIGNATURE"
  }
}
```

**Save the token for protected routes:**
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Test Error Cases:**

Invalid email:
```bash
curl -X POST http://localhost:7000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@example.com",
    "password": "SecurePass123"
  }'
```
Expected: `401 Unauthorized` - "Invalid email or password"

Wrong password:
```bash
curl -X POST http://localhost:7000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "WrongPassword"
  }'
```
Expected: `401 Unauthorized` - "Invalid email or password"

Missing fields:
```bash
curl -X POST http://localhost:7000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com"}'
```
Expected: `400 Bad Request` - "Email and password are required"

---

## Protected Todo Routes Tests

> **Important:** Replace `TOKEN_HERE` with the actual JWT token from login response.

### Test 3: Create Todo

**Endpoint:** `POST /todos`

**Valid Request:**
```bash
curl -X POST http://localhost:7000/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_HERE" \
  -d '{
    "title": "Buy groceries"
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Todo created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "title": "Buy groceries",
    "completed": false,
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2024-02-03T10:35:00Z"
  }
}
```

**Create multiple todos for testing:**
```bash
curl -X POST http://localhost:7000/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_HERE" \
  -d '{"title": "Learn Node.js"}'

curl -X POST http://localhost:7000/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_HERE" \
  -d '{"title": "Build REST API"}'

curl -X POST http://localhost:7000/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_HERE" \
  -d '{"title": "Deploy to production"}'
```

**Test Error Cases:**

Empty title:
```bash
curl -X POST http://localhost:7000/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_HERE" \
  -d '{"title": ""}'
```
Expected: `400 Bad Request` - "Todo title is required"

No authorization header:
```bash
curl -X POST http://localhost:7000/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Test"}'
```
Expected: `401 Unauthorized` - "No authorization token provided"

Invalid token:
```bash
curl -X POST http://localhost:7000/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer invalid_token" \
  -d '{"title": "Test"}'
```
Expected: `401 Unauthorized` - "Invalid token"

---

### Test 4: Get All Todos

**Endpoint:** `GET /todos`

**Request:**
```bash
curl -X GET http://localhost:7000/todos \
  -H "Authorization: Bearer TOKEN_HERE"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Todos retrieved successfully",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "title": "Deploy to production",
      "completed": false,
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "created_at": "2024-02-03T10:37:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "title": "Build REST API",
      "completed": false,
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "created_at": "2024-02-03T10:36:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "title": "Buy groceries",
      "completed": false,
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "created_at": "2024-02-03T10:35:00Z"
    }
  ],
  "count": 3
}
```

**Test Error Case:**

Missing authorization:
```bash
curl -X GET http://localhost:7000/todos
```
Expected: `401 Unauthorized` - "No authorization token provided"

---

### Test 5: Update Todo

**Endpoint:** `PUT /todos/:id`

**Get a todo ID from the get todos response above, then:**

**Update title only:**
```bash
curl -X PUT http://localhost:7000/todos/550e8400-e29b-41d4-a716-446655440001 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_HERE" \
  -d '{"title": "Buy groceries and cook"}'
```

**Update completion status:**
```bash
curl -X PUT http://localhost:7000/todos/550e8400-e29b-41d4-a716-446655440001 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_HERE" \
  -d '{"completed": true}'
```

**Update both:**
```bash
curl -X PUT http://localhost:7000/todos/550e8400-e29b-41d4-a716-446655440001 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_HERE" \
  -d '{
    "title": "Buy groceries and cook dinner",
    "completed": true
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Todo updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "title": "Buy groceries and cook dinner",
    "completed": true,
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2024-02-03T10:35:00Z"
  }
}
```

**Test Error Cases:**

Non-existent todo:
```bash
curl -X PUT http://localhost:7000/todos/00000000-0000-0000-0000-000000000000 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_HERE" \
  -d '{"title": "Updated"}'
```
Expected: `404 Not Found` - "Todo not found"

---

### Test 6: Delete Todo

**Endpoint:** `DELETE /todos/:id`

**Request:**
```bash
curl -X DELETE http://localhost:7000/todos/550e8400-e29b-41d4-a716-446655440001 \
  -H "Authorization: Bearer TOKEN_HERE"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Todo deleted successfully"
}
```

**Verify it's deleted:**
```bash
curl -X GET http://localhost:7000/todos \
  -H "Authorization: Bearer TOKEN_HERE"
```
The deleted todo should no longer appear in the list.

**Test Error Case:**

Deleting non-existent todo:
```bash
curl -X DELETE http://localhost:7000/todos/00000000-0000-0000-0000-000000000000 \
  -H "Authorization: Bearer TOKEN_HERE"
```
Expected: `404 Not Found` - "Todo not found"

---

## User Isolation Tests

### Test 7: Verify User Isolation

Create a second user and verify they cannot access the first user's todos.

**Create second user:**
```bash
curl -X POST http://localhost:7000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "SecurePass456"
  }'
```

**Login as second user:**
```bash
curl -X POST http://localhost:7000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "password": "SecurePass456"
  }'
```

Save the new token as `TOKEN_JANE`

**Try to access first user's todos:**
```bash
curl -X GET http://localhost:7000/todos \
  -H "Authorization: Bearer TOKEN_JANE"
```

Expected: Empty array `[]` - Jane has no todos

**Try to access first user's specific todo (if you have an ID):**
```bash
curl -X PUT http://localhost:7000/todos/550e8400-e29b-41d4-a716-446655440001 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_JANE" \
  -d '{"completed": true}'
```

Expected: `403 Forbidden` - "You do not have permission to update this todo"

---

## Advanced Testing

### Test 8: Token Expiry

Wait 1 hour (or modify JWT_EXPIRY in .env to a shorter time for testing):

```bash
# Set JWT_EXPIRY=5s in .env, then test
curl -X GET http://localhost:7000/todos \
  -H "Authorization: Bearer TOKEN_HERE"
```

After 5 seconds:
Expected: `401 Unauthorized` - "Token has expired"

---

## Testing with Postman

### Import Collection

1. Create a new Postman collection
2. Add these requests with the URLs and bodies as shown above
3. Use Postman's environment variables for:
   - `BASE_URL`: http://localhost:7000
   - `TOKEN`: (save from login response)
   - `USER_ID`: (save from signup response)
   - `TODO_ID`: (save from create todo response)

### Set Up Pre-request Script

For automatic token management:
```javascript
// In Postman Pre-request Script tab
if (pm.response.code === 200 || pm.response.code === 201) {
    var jsonData = pm.response.json();
    if (jsonData.data && jsonData.data.token) {
        pm.environment.set("token", jsonData.data.token);
    }
}
```

---

## Performance Testing

Test with multiple users and todos:

```bash
#!/bin/bash

# Create 5 users
for i in {1..5}; do
  curl -X POST http://localhost:7000/auth/signup \
    -H "Content-Type: application/json" \
    -d "{
      \"name\": \"User $i\",
      \"email\": \"user$i@example.com\",
      \"password\": \"SecurePass$i\"
    }"
done

# For each user, create 10 todos
for i in {1..5}; do
  for j in {1..10}; do
    curl -X POST http://localhost:7000/auth/login \
      -H "Content-Type: application/json" \
      -d "{
        \"email\": \"user$i@example.com\",
        \"password\": \"SecurePass$i\"
      }" | jq -r '.data.token' > token_$i.txt
  done
done
```

---

## Checklist

- [ ] Health endpoint works
- [ ] Signup creates user successfully
- [ ] Signup prevents duplicate emails
- [ ] Signup validates password length
- [ ] Login returns JWT token
- [ ] Login rejects wrong password
- [ ] Create todo adds to database
- [ ] Get todos returns user's todos only
- [ ] Update todo modifies correctly
- [ ] Delete todo removes from database
- [ ] User isolation prevents unauthorized access
- [ ] Missing auth header returns 401
- [ ] Invalid token returns 401
- [ ] Expired token returns 401
- [ ] Non-existent todo returns 404
- [ ] Server logs requests
- [ ] Graceful error handling

## Conclusion

All tests passing indicates the API is working correctly with proper:
- Authentication and authorization
- User isolation
- Error handling
- Database integration
- Security controls
