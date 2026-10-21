import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

const TIMEOUT_MS = 20_000;

export const isAiEnabled = () => Boolean(env.gemini.apiKey);

// Calls Gemini generateContent and returns the generated text.
// The API key is sent in a header and never leaves the server.
export const generateText = async ({ systemInstruction, contents, json = false }) => {
  if (!isAiEnabled()) {
    throw new ApiError(503, "AI features are not available right now.");
  }

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
          ...(systemInstruction && { systemInstruction: { parts: [{ text: systemInstruction }] } }),
          contents,
          ...(json && { generationConfig: { responseMimeType: "application/json" } }),
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      },
    );
  } catch (error) {
    console.error("Gemini request failed:", error.message);
    throw new ApiError(504, "The AI service took too long to respond. Please try again.");
  }

  if (response.status === 429) {
    throw new ApiError(429, "The AI service is busy. Please wait a moment and try again.");
  }
  if (!response.ok) {
    console.error("Gemini error:", response.status, await response.text());
    throw new ApiError(502, "The AI service couldn't respond. Please try again.");
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
};
