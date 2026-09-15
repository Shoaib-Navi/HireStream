import { z } from "zod";

export const updateStatusSchema = z.object({
  status: z
    .string({ error: "Status is required" })
    .trim()
    .toLowerCase()
    .pipe(z.enum(["pending", "accepted", "rejected"], { error: "Status must be accepted, rejected or pending" })),
});
