# Supabase Database Setup

This guide will help you set up the database schema in Supabase.

## Step 1: Create Supabase Project

1. Visit [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in or create an account
4. Create a new organization and project
5. Choose a region close to your location
6. Create a secure database password
7. Wait for the project to be provisioned (2-3 minutes)

## Step 2: Access the SQL Editor

1. In your Supabase dashboard, click "SQL Editor" in the left sidebar
2. Click "New Query"
3. Copy and paste the SQL migrations below

## Step 3: Run Database Migrations

### Users Table

```sql
-- Drop table if exists (for fresh setup)
-- DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Add comment to table
COMMENT ON TABLE users IS 'Users table for authentication';
COMMENT ON COLUMN users.id IS 'Unique user identifier (UUID)';
COMMENT ON COLUMN users.name IS 'User full name';
COMMENT ON COLUMN users.email IS 'User email (unique)';
COMMENT ON COLUMN users.password IS 'Bcrypt hashed password';
COMMENT ON COLUMN users.created_at IS 'Account creation timestamp';
COMMENT ON COLUMN users.updated_at IS 'Last update timestamp';
```

**Run this first, then in a new query:**

### Todos Table

```sql
-- Drop table if exists (for fresh setup)
-- DROP TABLE IF EXISTS todos CASCADE;

-- Create todos table
CREATE TABLE IF NOT EXISTS todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on user_id for faster user-specific queries
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at);

-- Create index on completed for filtering
CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_todos_user_created ON todos(user_id, created_at DESC);

-- Add comment to table
COMMENT ON TABLE todos IS 'User todos/tasks table';
COMMENT ON COLUMN todos.id IS 'Unique todo identifier (UUID)';
COMMENT ON COLUMN todos.title IS 'Todo title/description';
COMMENT ON COLUMN todos.completed IS 'Completion status (default: false)';
COMMENT ON COLUMN todos.user_id IS 'Foreign key to users table';
COMMENT ON COLUMN todos.created_at IS 'Todo creation timestamp';
COMMENT ON COLUMN todos.updated_at IS 'Last update timestamp';
```

**Run this as well, then in a new query:**

### Create Updated Trigger (Optional but Recommended)

```sql
-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for todos table
CREATE TRIGGER update_todos_updated_at BEFORE UPDATE ON todos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Step 4: Verify Tables

Run this query to verify your tables were created:

```sql
-- List all tables
SELECT tablename FROM pg_tables WHERE schemaname='public';

-- Check users table structure
\d users

-- Check todos table structure
\d todos
```

You should see both `users` and `todos` tables listed.

## Step 5: Get Your API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Under "Project API keys" section, you'll find:
   - **Project URL** - `SUPABASE_URL`
   - **anon (public)** - `SUPABASE_ANON_KEY`
   - **service_role (secret)** - `SUPABASE_SERVICE_ROLE_KEY`

3. Copy these values into your `.env` file

## Step 6: Enable Row Level Security (Optional but Recommended)

For extra security, enable RLS policies:

```sql
-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::uuid = id);

-- Enable RLS on todos table
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own todos
CREATE POLICY "Users can view own todos" ON todos
  FOR SELECT USING (auth.uid()::uuid = user_id);

-- Policy: Users can insert their own todos
CREATE POLICY "Users can insert own todos" ON todos
  FOR INSERT WITH CHECK (auth.uid()::uuid = user_id);

-- Policy: Users can update their own todos
CREATE POLICY "Users can update own todos" ON todos
  FOR UPDATE USING (auth.uid()::uuid = user_id);

-- Policy: Users can delete their own todos
CREATE POLICY "Users can delete own todos" ON todos
  FOR DELETE USING (auth.uid()::uuid = user_id);
```

## Database Schema Diagram

```
┌─────────────────────────────────┐
│           users                 │
├─────────────────────────────────┤
│ id (UUID) ◄─────────────────────┼────────────┐
│ name (VARCHAR)                  │            │
│ email (VARCHAR, UNIQUE)         │            │
│ password (VARCHAR)              │            │
│ created_at (TIMESTAMP)          │            │
│ updated_at (TIMESTAMP)          │            │
└─────────────────────────────────┘            │
                                                │
┌─────────────────────────────────┐            │
│           todos                 │            │
├─────────────────────────────────┤            │
│ id (UUID)                       │            │
│ title (VARCHAR)                 │            │
│ completed (BOOLEAN)             │            │
│ user_id (UUID) ◄───────────────┘ ON DELETE CASCADE
│ created_at (TIMESTAMP)          │
│ updated_at (TIMESTAMP)          │
└─────────────────────────────────┘
```

## Sample Data (For Testing)

Insert test data:

```sql
-- Insert a test user
INSERT INTO users (name, email, password)
VALUES (
  'John Doe',
  'john@example.com',
  '$2b$10$...' -- This would be a bcrypt hash
) RETURNING *;

-- Insert test todos
INSERT INTO todos (title, completed, user_id)
VALUES 
  ('Learn Node.js', false, '<user_id_from_above>'),
  ('Build a REST API', false, '<user_id_from_above>'),
  ('Deploy to production', false, '<user_id_from_above>');
```

## Troubleshooting

### Table Not Created
- Check if there are any SQL errors in the editor
- Ensure you're in the correct project and region
- Try running each query individually

### Cannot Connect to Database
- Verify your API keys are correct
- Check your project is in the correct region
- Ensure your `.env` variables match exactly

### Foreign Key Constraint Error
- Ensure the `users` table exists before creating `todos`
- Verify the `user_id` exists in the `users` table
- Check for typos in table/column names

### Permission Denied Errors
- Ensure you're using the anon key for regular operations
- Use service_role key only for admin operations
- Verify RLS policies aren't blocking your queries

## Useful Queries

```sql
-- Count total users
SELECT COUNT(*) as total_users FROM users;

-- Count todos by completion status
SELECT completed, COUNT(*) FROM todos GROUP BY completed;

-- Get user with most todos
SELECT u.id, u.name, COUNT(t.id) as todo_count
FROM users u
LEFT JOIN todos t ON u.id = t.user_id
GROUP BY u.id, u.name
ORDER BY todo_count DESC
LIMIT 1;

-- Get incomplete todos for a user
SELECT * FROM todos 
WHERE user_id = '<user_id>' AND completed = false
ORDER BY created_at DESC;

-- Delete all data (WARNING: Use with caution!)
-- DELETE FROM todos;
-- DELETE FROM users;
```

## Next Steps

1. Update your `.env` file with the API keys
2. Install dependencies: `npm install`
3. Start the server: `npm run dev`
4. Test the API endpoints using Postman or cURL
