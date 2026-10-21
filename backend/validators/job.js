import { z } from "zod";
import { objectId, requiredText } from "./common.js";

const numberField = (label) => z.coerce.number({ error: `${label} must be a number` });

export const postJobSchema = z.object({
  title: requiredText("Title", 100),
  description: requiredText("Description", 5000),
  // comma-separated list from the form
  requirements: requiredText("Requirements", 2000).transform((value) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  ),
  salary: numberField("Salary")
    .positive("Salary must be greater than 0")
    .max(10000, "Salary looks too large"),
  location: requiredText("Location", 100),
  jobType: requiredText("Job type", 50),
  experience: numberField("Experience level")
    .int("Experience level must be a whole number of years")
    .min(0, "Experience level can't be negative")
    .max(50, "Experience level looks too large"),
  position: numberField("Number of positions")
    .int("Number of positions must be a whole number")
    .min(1, "There must be at least 1 position")
    .max(1000, "Number of positions looks too large"),
  companyId: objectId,
});
