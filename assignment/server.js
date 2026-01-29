require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// POST /signup - Register a new user
app.post('/signup', async (req, res) => {
  try {
    const { name, email, age, location, password } = req.body;

    // Validate that all fields are provided
    if (!name || !email || !age || !location || !password) {
      return res.status(400).json({ 
        error: 'All fields are required: name, email, age, location, password' 
      });
    }

    // Basic input validation
    if (typeof age !== 'number' || age <= 0) {
      return res.status(400).json({ 
        error: 'Age must be a positive number' 
      });
    }

    if (!email.includes('@')) {
      return res.status(400).json({ 
        error: 'Invalid email format' 
      });
    }

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(409).json({ 
        error: 'Email already registered' 
      });
    }

    // Hash the password using bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Store user in Supabase
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          name,
          email,
          age,
          location,
          password: hashedPassword
        }
      ])
      .select();

    if (error) {
      // Check for unique constraint violation
      if (error.code === '23505') {
        return res.status(409).json({ 
          error: 'Email already registered' 
        });
      }
      throw error;
    }

    // Return success response
    res.status(201).json({ 
      message: 'User registered successfully' 
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      error: 'Internal server error during signup' 
    });
  }
});

// GET /myprofile - Fetch user profile by name
app.get('/myprofile', async (req, res) => {
  try {
    const { name } = req.query;

    // Validate name parameter
    if (!name) {
      return res.status(400).json({ 
        error: 'Name query parameter is required' 
      });
    }

    // Fetch user from Supabase
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, age, location')
      .eq('name', name)
      .single();

    if (error || !data) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    // Return user profile without password
    res.status(200).json(data);

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ 
      error: 'Internal server error while fetching profile' 
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'User Authentication API',
    endpoints: {
      signup: 'POST /signup',
      profile: 'GET /myprofile?name=<name>'
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
