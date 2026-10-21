import { z } from "zod";
import { EMPLOYMENT_TYPES, WORK_MODES } from "../../constants/index.js";

const chatMessage = z.object({
  role: z.enum(["user", "assistant"]),
  // assistant replies can be longer than what the user may type (2000 chars in the UI)
  content: z.string().trim().min(1).max(8000, "Message is too long"),
});

export const chatSchema = z.object({
  messages: z
    .array(chatMessage)
    .min(1, "Message is required")
    .max(30, "Conversation is too long. Please start a new chat.")
    .refine((messages) => messages.at(-1)?.role === "user", {
      message: "The last message must come from the user",
    }),
});

// Input for drafting a job description: everything the recruiter has typed so far
export const jobDescriptionSchema = z.object({
  title: z.string({ error: "Job title is required" }).trim().min(3, "Job title is required").max(120),
  companyName: z.string().trim().max(100).optional(),
  location: z.string().trim().max(100).optional(),
  employmentType: z.enum(EMPLOYMENT_TYPES).optional(),
  workMode: z.enum(WORK_MODES).optional(),
  skills: z.array(z.string().trim().min(1).max(50)).max(30).default([]),
  experience: z
    .object({
      min: z.coerce.number().int().min(0).max(50).default(0),
      max: z.coerce.number().int().min(0).max(50).nullable().default(null),
    })
    .optional(),
});
