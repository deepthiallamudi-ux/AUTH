/**
 * HTTP Status Codes
 */
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

/**
 * Error Messages
 */
const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  INVALID_TOKEN: 'Invalid token',
  TOKEN_EXPIRED: 'Token has expired',
  NO_TOKEN: 'No authorization token provided',
  USER_EXISTS: 'User with this email already exists',
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User not found',
  TODO_NOT_FOUND: 'Todo not found',
  FORBIDDEN_ACCESS: 'You do not have permission to access this resource',
  REQUIRED_FIELDS: 'Missing required fields',
  INVALID_PASSWORD_LENGTH: 'Password must be at least 6 characters long',
  INVALID_EMAIL_FORMAT: 'Invalid email format',
};

/**
 * Success Messages
 */
const SUCCESS_MESSAGES = {
  SIGNUP_SUCCESS: 'User registered successfully',
  LOGIN_SUCCESS: 'Login successful',
  TODO_CREATED: 'Todo created successfully',
  TODOS_FETCHED: 'Todos retrieved successfully',
  TODO_UPDATED: 'Todo updated successfully',
  TODO_DELETED: 'Todo deleted successfully',
  SERVER_RUNNING: 'Server is running',
};

module.exports = {
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
};
