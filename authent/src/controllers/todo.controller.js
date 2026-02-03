const { supabase } = require('../config/supabase');

/**
 * Create Todo Controller
 * Creates a new todo for the authenticated user
 */
const createTodo = async (req, res) => {
  try {
    const { title } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Todo title is required',
      });
    }

    // Insert new todo
    const { data: newTodo, error } = await supabase
      .from('todos')
      .insert([
        {
          title: title.trim(),
          completed: false,
          user_id: userId,
        },
      ])
      .select();

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error creating todo',
        error: error.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Todo created successfully',
      data: newTodo[0],
    });
  } catch (error) {
    console.error('Create todo error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Get Todos Controller
 * Retrieves all todos for the authenticated user
 */
const getTodos = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Fetch all todos for the user
    const { data: todos, error } = await supabase
      .from('todos')
      .select('id, title, completed, user_id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching todos',
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Todos retrieved successfully',
      data: todos,
      count: todos.length,
    });
  } catch (error) {
    console.error('Get todos error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Update Todo Controller
 * Updates a specific todo (user can only update their own todos)
 */
const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { title, completed } = req.body;

    // Validate input
    if (title === '' || (completed === null && title === undefined)) {
      return res.status(400).json({
        success: false,
        message: 'At least one field (title or completed) must be provided',
      });
    }

    // Check if todo belongs to the user
    const { data: todo, error: fetchError } = await supabase
      .from('todos')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (fetchError || !todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found',
      });
    }

    if (todo.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this todo',
      });
    }

    // Prepare update object
    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (completed !== undefined) updateData.completed = completed;

    // Update todo
    const { data: updatedTodo, error: updateError } = await supabase
      .from('todos')
      .update(updateData)
      .eq('id', id)
      .select();

    if (updateError) {
      return res.status(500).json({
        success: false,
        message: 'Error updating todo',
        error: updateError.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Todo updated successfully',
      data: updatedTodo[0],
    });
  } catch (error) {
    console.error('Update todo error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Delete Todo Controller
 * Deletes a specific todo (user can only delete their own todos)
 */
const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Check if todo belongs to the user
    const { data: todo, error: fetchError } = await supabase
      .from('todos')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (fetchError || !todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found',
      });
    }

    if (todo.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this todo',
      });
    }

    // Delete todo
    const { error: deleteError } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return res.status(500).json({
        success: false,
        message: 'Error deleting todo',
        error: deleteError.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Todo deleted successfully',
    });
  } catch (error) {
    console.error('Delete todo error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

module.exports = {
  createTodo,
  getTodos,
  updateTodo,
  deleteTodo,
};
