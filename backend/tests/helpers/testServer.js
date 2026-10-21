import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";

export const API = "/api/v1";

// Starts the API against a throwaway in-memory MongoDB
export const startTestServer = async () => {
  const mongod = await MongoMemoryServer.create();

  Object.assign(process.env, {
    NODE_ENV: "test",
    MONGO_URI: mongod.getUri(),
    JWT_SECRET: "test-secret",
    // blank values stop dotenv from filling in real credentials from backend/.env
    GEMINI_API_KEY: "",
    SMTP_HOST: "",
    CLOUD_NAME: "",
    API_KEY: "",
    API_SECRET: "",
    REQUIRE_EMAIL_VERIFICATION: "false",
  });
  delete process.env.VERCEL;

  const { default: app } = await import("../../src/app.js");
  const { connectDB, disconnectDB } = await import("../../src/config/db.js");
  const { allModels } = await import("../../src/models.js");

  await connectDB();
  await Promise.all(allModels.map((model) => model.init()));

  return {
    app,
    stop: async () => {
      await disconnectDB();
      await mongod.stop();
    },
  };
};

let userCounter = 0;

// Registers a user and returns a supertest agent that keeps their session cookie
export const signUp = async (app, { role = "candidate", ...overrides } = {}) => {
  userCounter += 1;
  const agent = request.agent(app);
  const credentials = {
    fullName: `Test ${role} ${userCounter}`,
    email: `${role}${userCounter}@test.com`,
    phone: "+91 98765 43210",
    password: "Password123",
    role,
    ...overrides,
  };

  const res = await agent.post(`${API}/auth/register`).send(credentials);
  if (res.status !== 201) {
    throw new Error(`Sign up failed: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return { agent, user: res.body.data.user, credentials };
};

export const validJob = (companyId, overrides = {}) => ({
  title: "React Developer",
  description: "Build delightful user interfaces for our hiring platform with a friendly team.",
  requirements: ["2+ years with React"],
  skills: ["React", "JavaScript"],
  employmentType: "full-time",
  workMode: "hybrid",
  location: "Bangalore",
  experience: { min: 1, max: 3 },
  salary: { min: 8, max: 12 },
  openings: 2,
  companyId,
  ...overrides,
});
