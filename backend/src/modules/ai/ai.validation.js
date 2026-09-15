import { z } from "zod";

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
