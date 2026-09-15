import { JOB_STATUS, ROLES } from "../../constants/index.js";
import { generateText } from "../../services/gemini.js";
import { ApiError } from "../../utils/ApiError.js";
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
You are the HireStream assistant, a friendly career assistant for a job portal called HireStream.
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

const DRAFT_INSTRUCTION = `
You write job posts for HireStream, an Indian job portal.
Reply with JSON only, shaped exactly like:
{"description": string, "responsibilities": string[], "requirements": string[]}

Rules:
- description: 3 short paragraphs (role summary, what the team does, why it's a good opportunity), plain text, no markdown headings
- responsibilities: 4-6 short bullet points, each a single sentence
- requirements: 4-6 short bullet points, each a single sentence, including the listed skills
- Write for the given title, skills and experience, and never invent salary, benefits or company facts
`;

const MAX_DESCRIPTION = 10000;
const MAX_BULLETS = 8;
const MAX_BULLET_LENGTH = 300;

// The model's output is untrusted input: keep only strings, trimmed to the same limits the job schema allows
const toBullets = (value) =>
  (Array.isArray(value) ? value : [])
    .filter((item) => typeof item === "string")
    .map((item) => item.trim().slice(0, MAX_BULLET_LENGTH))
    .filter(Boolean)
    .slice(0, MAX_BULLETS);

const describeRange = (experience) => {
  if (!experience) return "Not specified";
  if (experience.max) return `${experience.min}-${experience.max} years`;
  return `${experience.min}+ years`;
};

export const draftJobDescription = async (job) => {
  const prompt = [
    `Job title: ${job.title}`,
    `Company: ${job.companyName || "Not specified"}`,
    `Location: ${job.location || "Not specified"}`,
    `Employment type: ${job.employmentType || "Not specified"}`,
    `Work mode: ${job.workMode || "Not specified"}`,
    `Experience: ${describeRange(job.experience)}`,
    `Skills: ${job.skills?.length ? job.skills.join(", ") : "Not specified"}`,
  ].join("\n");

  const reply = await generateText({
    systemInstruction: DRAFT_INSTRUCTION,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    json: true,
  });

  let draft;
  try {
    draft = JSON.parse(reply);
  } catch {
    throw new ApiError(502, "The draft couldn't be created. Please try again.");
  }

  return {
    description: typeof draft.description === "string" ? draft.description.trim().slice(0, MAX_DESCRIPTION) : "",
    responsibilities: toBullets(draft.responsibilities),
    requirements: toBullets(draft.requirements),
  };
};
