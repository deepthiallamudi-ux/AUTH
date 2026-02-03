const express = require('express');
const { signup, login } = require('../controllers/auth.controller');

const router = express.Router();

/**
 * POST /auth/signup
 * Register a new user
 * Body: { name, email, password }
 */
router.post('/signup', signup);

/**
 * POST /auth/login
 * Authenticate user and return JWT token
 * Body: { email, password }
 */
router.post('/login', login);

module.exports = router;
