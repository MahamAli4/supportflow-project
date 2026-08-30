const { z } = require('zod');

const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long').max(50, 'Name cannot exceed 50 characters'),
  email: z.string().email('Please enter a valid email address').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.enum(['customer', 'agent']).default('customer'),
});

module.exports = {
  createUserSchema,
  createAgentSchema: createUserSchema,
};
