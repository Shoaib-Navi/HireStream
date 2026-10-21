import { env } from "../config/env.js";
import { Job } from "../models/job.js";
import { User } from "../models/user.js";
import { ApiError } from "../utils/ApiError.js";

const MAX_CONTEXT_JOBS = 20;
const GEMINI_TIMEOUT_MS = 20_000;

const buildSystemPrompt = (user, jobs) => `
You are HireStream AI, a friendly career assistant for a job portal called HireStream.
You help job seekers find jobs, improve their profiles, and prepare for interviews.

Current user info:
- Name: ${user?.fullname || "Guest"}
- Skills: ${user?.profile?.skills?.join(", ") || "Not specified"}
- Bio: ${user?.profile?.bio || "Not specified"}

Available jobs on the platform (use this to answer job-related questions):
${jobs
  .map(
    (job) =>
      `- ${job.title} at ${job.company?.name ?? "Unknown company"} | Location: ${job.location} | Salary: ${job.salary} LPA | Type: ${job.jobType}`,
  )
  .join("\n")}

Rules:
- Keep responses short, friendly, and helpful (max 3-4 lines)
- If asked about jobs, refer to the actual jobs listed above
- If asked to improve profile, give specific actionable advice
- Never make up job listings not in the list above
- Use bullet points for lists
- Always end with a helpful follow-up question or suggestion
`;

// Proxies the chatbot through the backend so the Gemini API key never reaches the browser
export const chat = async (req, res) => {
  if (!env.gemini.apiKey) {
    throw new ApiError(503, "The assistant is not available right now.");
  }

  const [user, jobs] = await Promise.all([
    req.id ? User.findById(req.id).select("fullname profile.skills profile.bio").lean() : null,
    Job.find()
      .select("title location salary jobType company")
      .populate({ path: "company", select: "name" })
      .sort({ createdAt: -1 })
      .limit(MAX_CONTEXT_JOBS)
      .lean(),
  ]);

  const contents = req.body.messages.map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }));
  // Gemini expects the conversation to start with a user turn (drops the greeting message)
  while (contents[0]?.role === "model") contents.shift();

  let response;
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(env.gemini.model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": env.gemini.apiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: buildSystemPrompt(user, jobs) }] },
          contents,
        }),
        signal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
      },
    );
  } catch (error) {
    console.error("Gemini request failed:", error);
    throw new ApiError(504, "The assistant took too long to respond. Please try again.");
  }

  if (response.status === 429) {
    throw new ApiError(429, "I'm getting too many requests. Please wait a moment and try again!");
  }
  if (!response.ok) {
    console.error("Gemini error:", response.status, await response.text());
    throw new ApiError(502, "Oops! Something went wrong. Please try again.");
  }

  const data = await response.json();
  const reply =
    data?.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ||
    "Sorry, I couldn't understand that. Try again!";

  return res.status(200).json({
    reply,
    success: true,
  });
};
