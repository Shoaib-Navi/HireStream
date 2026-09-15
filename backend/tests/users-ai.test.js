import assert from "node:assert/strict";
import { after, before, describe, test } from "node:test";
import request from "supertest";
import { API, signUp, startTestServer } from "./helpers/testServer.js";

let app;
let stop;
let candidate;
let recruiter;

before(async () => {
  ({ app, stop } = await startTestServer());
  candidate = await signUp(app);
  recruiter = await signUp(app, { role: "recruiter" });
});

after(async () => {
  await stop();
});

describe("users", () => {
  test("candidate profile exists right after sign up", async () => {
    const res = await candidate.agent.get(`${API}/users/me/profile`);
    assert.equal(res.status, 200);
    assert.equal(res.body.data.profile.isOpenToWork, true);
    assert.deepEqual(res.body.data.profile.skills, []);
  });

  test("recruiters have no candidate profile", async () => {
    const res = await recruiter.agent.get(`${API}/users/me/profile`);
    assert.equal(res.status, 403);
  });

  test("profile updates merge nested fields and clean lists", async () => {
    const first = await candidate.agent.patch(`${API}/users/me/profile`).send({
      headline: "Frontend Developer",
      skills: ["React", " React ", "Node.js"],
      links: { github: "https://github.com/test", linkedin: "https://linkedin.com/in/test" },
      experience: [{ title: "Developer", company: "Startup", startDate: "2023-01-01", isCurrent: true }],
      education: [{ institution: "IIT", degree: "B.Tech", startYear: 2018, endYear: 2022 }],
    });
    assert.equal(first.status, 200);
    assert.deepEqual(first.body.data.profile.skills, ["React", "Node.js"]);

    const second = await candidate.agent.patch(`${API}/users/me/profile`).send({ links: { github: "" } });
    assert.equal(second.status, 200);
    assert.equal(second.body.data.profile.links.github, "");
    assert.equal(second.body.data.profile.links.linkedin, "https://linkedin.com/in/test");
    assert.equal(second.body.data.profile.headline, "Frontend Developer");
  });

  test("profile validation", async () => {
    const badDates = await candidate.agent.patch(`${API}/users/me/profile`).send({
      experience: [{ title: "Dev", company: "Co", startDate: "2024-01-01", endDate: "2023-01-01" }],
    });
    assert.equal(badDates.status, 400);

    const badLink = await candidate.agent.patch(`${API}/users/me/profile`).send({ links: { portfolio: "ftp://x" } });
    assert.equal(badLink.status, 400);

    const empty = await candidate.agent.patch(`${API}/users/me/profile`).send({});
    assert.equal(empty.status, 400);
  });

  test("account update", async () => {
    const res = await recruiter.agent.patch(`${API}/users/me`).send({ fullName: "Renamed Recruiter" });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.user.fullName, "Renamed Recruiter");

    const badPhone = await recruiter.agent.patch(`${API}/users/me`).send({ phone: "abc" });
    assert.equal(badPhone.status, 400);
  });

  test("uploads validate file type and presence", async () => {
    const wrongType = await candidate.agent
      .put(`${API}/users/me/resume`)
      .attach("file", Buffer.from("plain"), { filename: "resume.txt", contentType: "text/plain" });
    assert.equal(wrongType.status, 400);
    assert.match(wrongType.body.message, /PDF/);

    const noFile = await candidate.agent.put(`${API}/users/me/avatar`);
    assert.equal(noFile.status, 400);

    // storage is not configured in tests, so a valid file reports the service as unavailable
    const noStorage = await candidate.agent
      .put(`${API}/users/me/avatar`)
      .attach("file", Buffer.from("fake image"), { filename: "me.png", contentType: "image/png" });
    assert.equal(noStorage.status, 503);
  });
});

describe("ai", () => {
  test("chat validates the conversation", async () => {
    const empty = await request(app).post(`${API}/ai/chat`).send({ messages: [] });
    assert.equal(empty.status, 400);

    const endsWithAssistant = await request(app)
      .post(`${API}/ai/chat`)
      .send({ messages: [{ role: "assistant", content: "Hi" }] });
    assert.equal(endsWithAssistant.status, 400);
  });

  test("chat reports when AI is not configured", async () => {
    const res = await request(app).post(`${API}/ai/chat`).send({ messages: [{ role: "user", content: "Hi" }] });
    assert.equal(res.status, 503);
  });
});
