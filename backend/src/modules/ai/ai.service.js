import { JOB_STATUS, ROLES } from "../../constants/index.js";
import { generateText } from "../../services/gemini.js";
import { Job } from "../jobs/job.model.js";
import { CandidateProfile } from "../users/candidateProfile.model.js";
import { User } from "../users/user.model.js";

const MAX_CONTEXT_JOBS = 20;

const formatSalary = (salary) => {
  if (!salary?.min && !salary?.max) return "Not disclosed";
  if (salary.min === salary.max || !salary.max) return `${salary.min} LPA`;
  return `${salary.min ?? 0}-${salary.max} LPA`;
};

const buildSystemPrompt = ({ user, profile, jobs }) => `
You are HireStream AI, a friendly career assistant for a job portal called HireStream.
You help job seekers find jobs, improve their profiles and prepare for interviews,
and help recruiters write better job posts and evaluate candidates.

Current user:
- Name: ${user?.fullName || "Guest"}
- Role: ${user?.role || "visitor"}
- Headline: ${profile?.headline || "Not specified"}
- Skills: ${profile?.skills?.join(", ") || "Not specified"}
- Experience: ${profile?.experienceYears ?? "Not specified"} years

Open jobs on the platform (use these to answer job-related questions):
${jobs
  .map(
    (job) =>
      `- ${job.title} at ${job.company?.name ?? "Unknown company"} | ${job.location} | ${job.workMode} | ${job.employmentType} | Salary: ${formatSalary(job.salary)}`,
  )
  .join("\n")}

Rules:
- Keep responses short, friendly and helpful (max 3-4 lines)
- If asked about jobs, refer only to the jobs listed above and never invent listings
- If asked to improve a profile, give specific actionable advice
- Use bullet points for lists
- End with a helpful follow-up question or suggestion
`;

export const chatWithAssistant = async ({ userId, messages }) => {
  const [user, jobs] = await Promise.all([
    userId ? User.findById(userId).select("fullName role").lean() : null,
    Job.find({ status: JOB_STATUS.OPEN })
      .select("title location salary employmentType workMode company")
      .populate({ path: "company", select: "name" })
      .sort({ createdAt: -1 })
      .limit(MAX_CONTEXT_JOBS)
      .lean(),
  ]);
  const profile =
    user?.role === ROLES.CANDIDATE
      ? await CandidateProfile.findOne({ user: userId }).select("headline skills experienceYears").lean()
      : null;

  const contents = messages.map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }));
  // Gemini expects the conversation to start with a user turn (drops the greeting message)
  while (contents[0]?.role === "model") contents.shift();

  const reply = await generateText({ systemInstruction: buildSystemPrompt({ user, profile, jobs }), contents });
  return reply || "Sorry, I couldn't understand that. Try again!";
};
