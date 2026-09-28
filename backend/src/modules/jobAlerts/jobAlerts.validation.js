import { z } from "zod";
import { ALERT_FREQUENCIES } from "../../constants/index.js";
import { jobSearchShape } from "../jobs/jobs.validation.js";

const frequency = z.enum(Object.values(ALERT_FREQUENCIES), { error: "Please choose daily or weekly" });

export const createAlertSchema = z.object({
  criteria: z.object(jobSearchShape).default({}),
  frequency: frequency.default(ALERT_FREQUENCIES.DAILY),
});

export const updateAlertSchema = z
  .object({ frequency, isActive: z.boolean() })
  .partial()
  .refine((updates) => Object.keys(updates).length > 0, { message: "Nothing to update" });
