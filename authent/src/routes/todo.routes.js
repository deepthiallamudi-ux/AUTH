const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const {
  createTodo,
  getTodos,
  updateTodo,
  deleteTodo,
} = require('../controllers/todo.controller');

const router = express.Router();

// All routes are protected with authMiddleware
router.use(authMiddleware);

/**
 * POST /todos
 * Create a new todo for the authenticated user
 * Body: { title }
 */
router.post('/', createTodo);

/**
 * GET /todos
 * Get all todos for the authenticated user
 */
router.get('/', getTodos);

/**
 * PUT /todos/:id
 * Update a specific todo (user can only update their own)
 * Body: { title?, completed? }
 */
router.put('/:id', updateTodo);

/**
 * DELETE /todos/:id
 * Delete a specific todo (user can only delete their own)
 */
router.delete('/:id', deleteTodo);

module.exports = router;
