# User Authentication API - Setup Instructions

## 🗄️ Supabase Database Setup

### Step 1: Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Create a new project

### Step 2: Create the Users Table
1. In your Supabase dashboard, go to the **SQL Editor**
2. Run the following SQL command:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  age INTEGER NOT NULL,
  location TEXT NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Step 3: Get Your Supabase Credentials
1. Go to **Project Settings** → **API**
2. Copy your:
   - Project URL
   - Anon/Public Key

### Step 4: Configure Environment Variables
1. Open the `.env` file in the `assignment` folder
2. Replace the placeholder values:
   ```
   SUPABASE_URL=your_actual_supabase_url
   SUPABASE_KEY=your_actual_supabase_anon_key
   PORT=3000
   ```

## 🚀 Running the Application

### Start the Server
```bash
cd assignment
node server.js
```

The server will start at `http://localhost:3000`

## 📝 API Endpoints

### 1. Sign Up (Register User)
**Endpoint:** `POST /signup`

**Request Body:**
```json
{
  "name": "Ravi",
  "email": "ravi@gmail.com",
  "age": 22,
  "location": "Bangalore",
  "password": "123456"
}
```

**Success Response (201):**
```json
{
  "message": "User registered successfully"
}
```

**Error Responses:**
- `400` - Missing required fields or invalid input
- `409` - Email already registered
- `500` - Internal server error

### 2. Get User Profile
**Endpoint:** `GET /myprofile?name=<name>`

**Example:** `GET /myprofile?name=Ravi`

**Success Response (200):**
```json
{
  "id": "uuid-here",
  "name": "Ravi",
  "email": "ravi@gmail.com",
  "age": 22,
  "location": "Bangalore"
}
```

**Error Responses:**
- `400` - Name parameter missing
- `404` - User not found
- `500` - Internal server error

## 🧪 Testing the APIs

### Using cURL

**Sign Up:**
```bash
curl -X POST http://localhost:3000/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ravi",
    "email": "ravi@gmail.com",
    "age": 22,
    "location": "Bangalore",
    "password": "123456"
  }'
```

**Get Profile:**
```bash
curl http://localhost:3000/myprofile?name=Ravi
```

### Using Postman or Thunder Client
1. **POST** to `http://localhost:3000/signup` with JSON body
2. **GET** to `http://localhost:3000/myprofile?name=Ravi`

## ✅ Features Implemented

- ✓ User registration with all required fields
- ✓ Password hashing using bcrypt (10 salt rounds)
- ✓ Email uniqueness validation
- ✓ Proper error handling with try/catch
- ✓ Profile API excludes password
- ✓ 404 response when user not found
- ✓ Basic input validation
- ✓ Async/await throughout
- ✓ Supabase JS Client integration

## 🔒 Security Features

1. **Password Hashing:** Passwords are hashed using bcrypt before storage
2. **Password Exclusion:** Passwords are NEVER returned in any API response
3. **Email Uniqueness:** Duplicate email signups are prevented
4. **Input Validation:** Basic validation for email format and age
5. **Error Handling:** Comprehensive error handling for all endpoints

## 📁 Project Structure

```
assignment/
├── .env              # Environment variables (Supabase credentials)
├── server.js         # Main application file
└── README.md         # This file
```

## 🛠️ Dependencies

- `express` - Web framework
- `bcrypt` - Password hashing
- `@supabase/supabase-js` - Supabase client
- `dotenv` - Environment variable management
