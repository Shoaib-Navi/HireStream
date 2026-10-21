import assert from "node:assert/strict";
import { after, before, describe, test } from "node:test";
import request from "supertest";
import { API, signUp, startTestServer, validJob } from "./helpers/testServer.js";

let app;
let stop;
let recruiter;
let strongCandidate;
let weakCandidate;
let jobId;

// validJob() asks for React and JavaScript, 1-3 years, in Bangalore, hybrid
before(async () => {
  ({ app, stop } = await startTestServer());

  recruiter = await signUp(app, { role: "recruiter" });
  strongCandidate = await signUp(app);
  weakCandidate = await signUp(app);

  await strongCandidate.agent.patch(`${API}/users/me/profile`).send({
    skills: ["react", "JavaScript", "CSS"],
    experienceYears: 4,
    location: "Bangalore",
  });
  await weakCandidate.agent.patch(`${API}/users/me/profile`).send({
    skills: ["Python"],
    experienceYears: 0,
    location: "Chennai",
  });

  const companyId = (await recruiter.agent.post(`${API}/companies`).send({ name: "Match Works" })).body.data.company._id;
  jobId = (await recruiter.agent.post(`${API}/jobs`).send(validJob(companyId))).body.data.job._id;
});

after(async () => {
  await stop();
});

describe("match score", () => {
  test("a matching profile scores high, and skills are compared case-insensitively", async () => {
    const res = await strongCandidate.agent.get(`${API}/jobs/${jobId}`);
    const { match } = res.body.data.job;

    assert.equal(match.score, 100);
    assert.deepEqual(match.matchedSkills.sort(), ["JavaScript", "React"]);
    assert.deepEqual(match.missingSkills, []);
  });

  test("a weaker profile scores lower and lists the skills to add", async () => {
    const res = await weakCandidate.agent.get(`${API}/jobs/${jobId}`);
    const { match } = res.body.data.job;

    assert.ok(match.score < 30, `expected a low score, got ${match.score}`);
    assert.deepEqual(match.matchedSkills, []);
    assert.deepEqual(match.missingSkills.sort(), ["JavaScript", "React"]);
  });

  test("the job board includes the match, and guests and recruiters get none", async () => {
    const board = await strongCandidate.agent.get(`${API}/jobs`);
    assert.equal(board.body.data.jobs[0].match.score, 100);

    const guest = await request(app).get(`${API}/jobs/${jobId}`);
    assert.equal(guest.body.data.job.match, null);

    const owner = await recruiter.agent.get(`${API}/jobs/${jobId}`);
    assert.equal(owner.body.data.job.match, null);
  });

  test("recruiters see how well each applicant fits the job", async () => {
    await strongCandidate.agent.patch(`${API}/users/me/profile`).send({});
    const { CandidateProfile } = await import("../src/modules/users/candidateProfile.model.js");
    await CandidateProfile.updateOne(
      { user: strongCandidate.user._id },
      { resume: { url: "https://files.test/resume.pdf", originalName: "resume.pdf" } },
    );

    const applied = await strongCandidate.agent.post(`${API}/jobs/${jobId}/applications`).send({});
    assert.equal(applied.status, 201);

    const list = await recruiter.agent.get(`${API}/jobs/${jobId}/applications`);
    assert.equal(list.body.data.applications[0].match.score, 100);

    const detail = await recruiter.agent.get(`${API}/applications/${applied.body.data.application._id}`);
    assert.equal(detail.body.data.application.match.score, 100);

    // candidates never see the recruiter's copy of the score
    const candidateView = await strongCandidate.agent.get(`${API}/applications/${applied.body.data.application._id}`);
    assert.equal(candidateView.body.data.application.match, undefined);
  });
});

describe("job description drafts", () => {
  test("only recruiters can ask for a draft, and the input is validated", async () => {
    assert.equal((await request(app).post(`${API}/ai/job-description`).send({ title: "React Developer" })).status, 401);
    assert.equal(
      (await strongCandidate.agent.post(`${API}/ai/job-description`).send({ title: "React Developer" })).status,
      403,
    );

    const invalid = await recruiter.agent.post(`${API}/ai/job-description`).send({ title: "R" });
    assert.equal(invalid.status, 400);
  });

  test("reports the service as unavailable when no API key is configured", async () => {
    const res = await recruiter.agent
      .post(`${API}/ai/job-description`)
      .send({ title: "React Developer", skills: ["React"], workMode: "remote" });
    assert.equal(res.status, 503);
  });
});
