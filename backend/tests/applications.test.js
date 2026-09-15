import assert from "node:assert/strict";
import { after, before, describe, test } from "node:test";
import request from "supertest";
import { API, signUp, startTestServer, validJob } from "./helpers/testServer.js";

let app;
let stop;
let CandidateProfile;
let recruiter;
let otherRecruiter;
let candidate;
let secondCandidate;
let jobId;
let draftJobId;

const giveResume = (userId) =>
  CandidateProfile.updateOne(
    { user: userId },
    { resume: { url: "https://files.test/resume.pdf", originalName: "resume.pdf" } },
  );

before(async () => {
  ({ app, stop } = await startTestServer());
  ({ CandidateProfile } = await import("../src/modules/users/candidateProfile.model.js"));

  recruiter = await signUp(app, { role: "recruiter" });
  otherRecruiter = await signUp(app, { role: "recruiter" });
  candidate = await signUp(app);
  secondCandidate = await signUp(app);

  const company = await recruiter.agent.post(`${API}/companies`).send({ name: "Hiring Co" });
  const companyId = company.body.data.company._id;
  const job = await recruiter.agent.post(`${API}/jobs`).send(validJob(companyId));
  jobId = job.body.data.job._id;
  const draft = await recruiter.agent.post(`${API}/jobs`).send(validJob(companyId, { status: "draft" }));
  draftJobId = draft.body.data.job._id;
});

after(async () => {
  await stop();
});

describe("applications", () => {
  test("a resume is required before applying", async () => {
    const res = await candidate.agent.post(`${API}/jobs/${jobId}/applications`).send({});
    assert.equal(res.status, 400);
    assert.match(res.body.message, /resume/i);
  });

  test("only candidates can apply", async () => {
    const asRecruiter = await recruiter.agent.post(`${API}/jobs/${jobId}/applications`).send({});
    assert.equal(asRecruiter.status, 403);
    const asGuest = await request(app).post(`${API}/jobs/${jobId}/applications`).send({});
    assert.equal(asGuest.status, 401);
  });

  test("candidate applies once; duplicates are rejected", async () => {
    await giveResume(candidate.user._id);

    const first = await candidate.agent.post(`${API}/jobs/${jobId}/applications`).send({ coverLetter: "I'd love to join." });
    assert.equal(first.status, 201);
    assert.equal(first.body.data.application.status, "applied");
    assert.equal(first.body.data.application.resume.originalName, "resume.pdf");

    const second = await candidate.agent.post(`${API}/jobs/${jobId}/applications`).send({});
    assert.equal(second.status, 409);
  });

  test("simultaneous duplicate applications are blocked", async () => {
    await giveResume(secondCandidate.user._id);
    const results = await Promise.all([
      secondCandidate.agent.post(`${API}/jobs/${jobId}/applications`).send({}),
      secondCandidate.agent.post(`${API}/jobs/${jobId}/applications`).send({}),
    ]);
    assert.deepEqual(results.map((res) => res.status).sort(), [201, 409]);
  });

  test("draft jobs don't accept applications", async () => {
    const res = await candidate.agent.post(`${API}/jobs/${draftJobId}/applications`).send({});
    assert.equal(res.status, 400);
  });

  test("job details reflect the application", async () => {
    const res = await candidate.agent.get(`${API}/jobs/${jobId}`);
    assert.equal(res.body.data.job.hasApplied, true);
    assert.equal(res.body.data.job.applicationCount, 2);
  });

  let applicationId;

  test("recruiter sees applicants with profile summaries, never passwords", async () => {
    const res = await recruiter.agent.get(`${API}/jobs/${jobId}/applications`);
    assert.equal(res.status, 200);
    assert.equal(res.body.data.applications.length, 2);
    assert.equal(res.body.data.statusCounts.applied, 2);

    const application = res.body.data.applications.find((item) => item.candidate._id === candidate.user._id);
    assert.ok(application.candidate.email);
    assert.ok(!("password" in application.candidate));
    assert.ok("candidateProfile" in application);
    applicationId = application._id;
  });

  test("other recruiters and candidates cannot see applicants", async () => {
    const other = await otherRecruiter.agent.get(`${API}/jobs/${jobId}/applications`);
    assert.equal(other.status, 404);
    const asCandidate = await candidate.agent.get(`${API}/jobs/${jobId}/applications`);
    assert.equal(asCandidate.status, 403);
  });

  test("recruiter moves an application through the pipeline", async () => {
    const shortlist = await recruiter.agent.patch(`${API}/applications/${applicationId}/status`).send({ status: "shortlisted" });
    assert.equal(shortlist.status, 200);

    const interview = await recruiter.agent
      .patch(`${API}/applications/${applicationId}/status`)
      .send({ status: "interview", note: "Technical round on Monday" });
    assert.equal(interview.status, 200);
    assert.deepEqual(
      interview.body.data.application.statusHistory.map((entry) => entry.status),
      ["applied", "shortlisted", "interview"],
    );

    const invalid = await recruiter.agent.patch(`${API}/applications/${applicationId}/status`).send({ status: "withdrawn" });
    assert.equal(invalid.status, 400);

    const other = await otherRecruiter.agent.patch(`${API}/applications/${applicationId}/status`).send({ status: "hired" });
    assert.equal(other.status, 404);

    const asCandidate = await candidate.agent.patch(`${API}/applications/${applicationId}/status`).send({ status: "hired" });
    assert.equal(asCandidate.status, 403);
  });

  test("candidate lists own applications and can open the detail", async () => {
    const list = await candidate.agent.get(`${API}/applications/mine`);
    assert.equal(list.status, 200);
    assert.equal(list.body.meta.total, 1);
    assert.equal(list.body.data.applications[0].status, "interview");
    assert.equal(list.body.data.applications[0].company.name, "Hiring Co");

    const filtered = await candidate.agent.get(`${API}/applications/mine?status=hired`);
    assert.equal(filtered.body.meta.total, 0);

    const detail = await candidate.agent.get(`${API}/applications/${applicationId}`);
    assert.equal(detail.status, 200);
    assert.equal(detail.body.data.application.statusHistory.length, 3);
  });

  test("application details are private", async () => {
    const otherCandidate = await secondCandidate.agent.get(`${API}/applications/${applicationId}`);
    assert.equal(otherCandidate.status, 404);

    const owner = await recruiter.agent.get(`${API}/applications/${applicationId}`);
    assert.equal(owner.status, 200);
    assert.ok("candidateProfile" in owner.body.data.application);

    const otherRecruiterView = await otherRecruiter.agent.get(`${API}/applications/${applicationId}`);
    assert.equal(otherRecruiterView.status, 404);
  });
});
