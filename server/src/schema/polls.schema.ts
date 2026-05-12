import z from "zod";

// Create poll with optional questions (can create empty poll first)
export const createPollSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
  responseMode: z.enum(["ANONYMOUS", "AUTHENTICATED"]),
  expiresAt: z.string().datetime("Invalid date format"),
  questions: z
    .array(
      z.object({
        question: z.string().min(1, "Question text is required"),
        required: z.boolean().default(true),
        order: z.number().int().positive(),
        options: z
          .array(
            z.object({
              text: z.string().min(1, "Option text is required"),
              order: z.number().int().positive(),
            })
          )
          .min(2, "Each question must have at least 2 options"),
      })
    )
    .optional(), // Can be empty to create poll first, add questions later
});

// Update poll (title, description, expiresAt only - questions managed separately)
export const updatePollSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
});

// Add question to existing poll
export const addQuestionSchema = z.object({
  question: z.string().min(1, "Question text is required"),
  required: z.boolean().default(true),
  order: z.number().int().positive(),
  options: z
    .array(
      z.object({
        text: z.string().min(1, "Option text is required"),
        order: z.number().int().positive(),
      })
    )
    .min(2, "Must have at least 2 options"),
});

// Submit poll response
export const submitResponseSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().uuid("Invalid question ID"),
        optionId: z.string().uuid("Invalid option ID"),
      })
    )
    .min(1, "Must answer at least one question"),
});

// Publish poll
export const publishPollSchema = z.object({
  // No body required, just marks as published
});