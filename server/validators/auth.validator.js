const { z } = require('zod');

// Schema for user registration (public registration forces role to 'customer')
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['customer', 'agent']).optional().refine((role) => !role || role === 'customer', {
    message: 'Public registration does not allow registering as an agent',
  }),
});

// Schema for user login
const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

module.exports = {
  registerSchema,
  loginSchema,
};
