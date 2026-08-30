const { z } = require('zod');

const VALID_CATEGORIES = ['Billing', 'Technical', 'Account', 'Order', 'General', 'Not Sure'];

const createTicketSchema = z.object({
  subject: z.string().trim().min(3, 'Subject must be at least 3 characters'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters'),
  category: z
    .string()
    .trim()
    .optional()
    .transform((val) => {
      if (!val || val === 'Not Sure') return 'General';
      return val;
    }),
  priority: z.enum(['Low', 'Medium', 'High']).optional().default('Medium'),
});

const updateTicketStatusSchema = z.object({
  status: z.enum(['New', 'Assigned', 'In Progress', 'Resolved'], {
    errorMap: () => ({ message: 'Status must be New, Assigned, In Progress, or Resolved' }),
  }),
  resolutionNote: z.string().trim().optional(),
});

const resolveTicketSchema = z.object({
  resolutionNote: z
    .string({ required_error: 'Resolution note is required when resolving a ticket' })
    .trim()
    .min(1, 'Resolution note cannot be empty'),
});

const createMessageSchema = z.object({
  message: z
    .string({ required_error: 'Message content is required' })
    .trim()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message cannot exceed 2000 characters'),
});

// Zod schema for validating Gemini AI output
const aiTriageOutputSchema = z.object({
  category: z.enum(['Billing', 'Technical', 'Account', 'Order', 'General'], {
    errorMap: () => ({ message: 'AI category must be Billing, Technical, Account, Order, or General' }),
  }),
  priority: z.enum(['Low', 'Medium', 'High'], {
    errorMap: () => ({ message: 'AI priority must be Low, Medium, or High' }),
  }),
  summary: z
    .string({ required_error: 'AI summary is required' })
    .trim()
    .min(5, 'AI summary must be at least 5 characters')
    .max(300, 'AI summary cannot exceed 300 characters'),
});

// Zod schema for validating Human Agent Triage Review payload
const triageReviewSchema = z.object({
  category: z.enum(['Billing', 'Technical', 'Account', 'Order', 'General'], {
    errorMap: () => ({ message: 'Category must be Billing, Technical, Account, Order, or General' }),
  }),
  priority: z.enum(['Low', 'Medium', 'High'], {
    errorMap: () => ({ message: 'Priority must be Low, Medium, or High' }),
  }),
  summary: z
    .string({ required_error: 'Summary is required' })
    .trim()
    .min(3, 'Summary must be at least 3 characters')
    .max(500, 'Summary cannot exceed 500 characters'),
});

module.exports = {
  createTicketSchema,
  updateTicketStatusSchema,
  resolveTicketSchema,
  createMessageSchema,
  aiTriageOutputSchema,
  triageReviewSchema,
  VALID_CATEGORIES,
};
