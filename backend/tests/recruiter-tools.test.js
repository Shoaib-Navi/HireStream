import assert from "node:assert/strict";
import { after, before, describe, test } from "node:test";
import request from "supertest";
import { API, signUp, startTestServer, validJob } from "./helpers/testServer.js";

let app;
let stop;
let CandidateProfile;
let Job;
let SavedJob;
let recruiter;
let otherRecruiter;
let candidate;
let companyId;
let secondCompanyId;

const giveResume = (userId) =>
  CandidateProfile.updateOne({ user: userId }, { resume: { url: "https://files.test/resume.pdf", originalName: "resume.pdf" } });

before(async () => {
  ({ app, stop } = await startTestServer());
  ({ CandidateProfile } = await import("../src/modules/users/candidateProfile.model.js"));
  ({ Job } = await import("../src/modules/jobs/job.model.js"));
  ({ SavedJob } = await import("../src/modules/savedJobs/savedJob.model.js"));

  recruiter = await signUp(app, { role: "recruiter" });
  otherRecruiter = await signUp(app, { role: "recruiter" });
  candidate = await signUp(app);
  await giveResume(candidate.user._id);

  companyId = (await recruiter.agent.post(`${API}/companies`).send({ name: "Northwind" })).body.data.company._id;
  secondCompanyId = (await recruiter.agent.post(`${API}/companies`).send({ name: "Southwind" })).body.data.company._id;
});

after(async () => {
  await stop();
});

describe("editing jobs", () => {
  let jobId;

  before(async () => {
    jobId = (await recruiter.agent.post(`${API}/jobs`).send(validJob(companyId))).body.data.job._id;
  });

  test("owner updates only the fields sent", async () => {
    const res = await recruiter.agent.patch(`${API}/jobs/${jobId}`).send({ title: "Senior React Developer", openings: 4 });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.job.title, "Senior React Developer");
    assert.equal(res.body.data.job.openings, 4);
    assert.deepEqual(res.body.data.job.skills, ["React", "JavaScript"]);
    assert.equal(res.body.data.job.status, "open");
  });

  test("validation, ownership and company changes", async () => {
    const empty = await recruiter.agent.patch(`${API}/jobs/${jobId}`).send({});
    assert.equal(empty.status, 400);

    const invalid = await recruiter.agent.patch(`${API}/jobs/${jobId}`).send({ salary: { min: 10, max: 5 } });
    assert.equal(invalid.status, 400);

    const other = await otherRecruiter.agent.patch(`${API}/jobs/${jobId}`).send({ title: "Hijacked role" });
    assert.equal(other.status, 404);

    const foreignCompany = (await otherRecruiter.agent.post(`${API}/companies`).send({ name: "Elsewhere" })).body.data.company._id;
    const moveToForeign = await recruiter.agent.patch(`${API}/jobs/${jobId}`).send({ companyId: foreignCompany });
    assert.equal(moveToForeign.status, 404);

    await candidate.agent.post(`${API}/jobs/${jobId}/applications`).send({});
    const moved = await recruiter.agent.patch(`${API}/jobs/${jobId}`).send({ companyId: secondCompanyId });
    assert.equal(moved.status, 200);
    const application = (await recruiter.agent.get(`${API}/jobs/${jobId}/applications`)).body.data.applications[0];
    assert.equal(application.company, secondCompanyId);
  });
});

describe("job status and deletion", () => {
  test("closing hides the job from the board and reopening needs a future deadline", async () => {
    const jobId = (await recruiter.agent.post(`${API}/jobs`).send(validJob(companyId, { title: "Closable role" }))).body.data.job._id;

    const closed = await recruiter.agent.patch(`${API}/jobs/${jobId}/status`).send({ status: "closed" });
    assert.equal(closed.status, 200);
    assert.ok(closed.body.data.job.closedAt);

    const board = await request(app).get(`${API}/jobs?q=closable`);
    assert.equal(board.body.meta.total, 0);

    await Job.updateOne({ _id: jobId }, { deadline: new Date("2020-01-01") });
    const reopenPastDeadline = await recruiter.agent.patch(`${API}/jobs/${jobId}/status`).send({ status: "open" });
    assert.equal(reopenPastDeadline.status, 400);

    await Job.updateOne({ _id: jobId }, { deadline: null });
    const reopened = await recruiter.agent.patch(`${API}/jobs/${jobId}/status`).send({ status: "open" });
    assert.equal(reopened.status, 200);
    assert.equal(reopened.body.data.job.closedAt, undefined);

    const invalid = await recruiter.agent.patch(`${API}/jobs/${jobId}/status`).send({ status: "archived" });
    assert.equal(invalid.status, 400);
  });

  test("jobs with applicants can't be deleted or moved back to draft", async () => {
    const jobId = (await recruiter.agent.post(`${API}/jobs`).send(validJob(companyId, { title: "Popular role" }))).body.data.job._id;
    await candidate.agent.post(`${API}/jobs/${jobId}/applications`).send({});

    const toDraft = await recruiter.agent.patch(`${API}/jobs/${jobId}/status`).send({ status: "draft" });
    assert.equal(toDraft.status, 400);

    const deleted = await recruiter.agent.delete(`${API}/jobs/${jobId}`);
    assert.equal(deleted.status, 409);
  });

  test("jobs without applicants can be deleted, which also removes saved copies", async () => {
    const jobId = (await recruiter.agent.post(`${API}/jobs`).send(validJob(companyId, { title: "Short-lived role" }))).body.data.job._id;
    await candidate.agent.put(`${API}/saved-jobs/${jobId}`);

    const other = await otherRecruiter.agent.delete(`${API}/jobs/${jobId}`);
    assert.equal(other.status, 404);

    const deleted = await recruiter.agent.delete(`${API}/jobs/${jobId}`);
    assert.equal(deleted.status, 200);
    assert.equal(await Job.countDocuments({ _id: jobId }), 0);
    assert.equal(await SavedJob.countDocuments({ job: jobId }), 0);
  });
});

describe("private notes", () => {
  let applicationId;

  before(async () => {
    const jobId = (await recruiter.agent.post(`${API}/jobs`).send(validJob(companyId, { title: "Noted role" }))).body.data.job._id;
    applicationId = (await candidate.agent.post(`${API}/jobs/${jobId}/applications`).send({})).body.data.application._id;
  });

  test("recruiter adds notes that only the recruiting side can read", async () => {
    const added = await recruiter.agent.post(`${API}/applications/${applicationId}/notes`).send({ body: "Strong portfolio" });
    assert.equal(added.status, 201);
    assert.equal(added.body.data.notes.length, 1);
    assert.equal(added.body.data.notes[0].author.fullName, recruiter.user.fullName);

    const recruiterView = await recruiter.agent.get(`${API}/applications/${applicationId}`);
    assert.equal(recruiterView.body.data.application.notes[0].body, "Strong portfolio");

    const candidateView = await candidate.agent.get(`${API}/applications/${applicationId}`);
    assert.equal(candidateView.status, 200);
    assert.ok(!("notes" in candidateView.body.data.application));

    const candidateList = await candidate.agent.get(`${API}/applications/mine`);
    assert.ok(candidateList.body.data.applications.every((application) => !("notes" in application)));
  });

  test("notes are validated and limited to the job owner", async () => {
    const empty = await recruiter.agent.post(`${API}/applications/${applicationId}/notes`).send({ body: "   " });
    assert.equal(empty.status, 400);

    const other = await otherRecruiter.agent.post(`${API}/applications/${applicationId}/notes`).send({ body: "Sneaky" });
    assert.equal(other.status, 404);

    const asCandidate = await candidate.agent.post(`${API}/applications/${applicationId}/notes`).send({ body: "Hi" });
    assert.equal(asCandidate.status, 403);
  });

  test("status updates keep existing notes", async () => {
    await recruiter.agent.patch(`${API}/applications/${applicationId}/status`).send({ status: "interview", note: "See you Monday" });
    const view = await recruiter.agent.get(`${API}/applications/${applicationId}`);
    assert.equal(view.body.data.application.notes.length, 1);
    assert.equal(view.body.data.application.status, "interview");
  });
});

describe("recruiter overview", () => {
  test("summarizes jobs, pipeline and recent applicants for the recruiter only", async () => {
    const res = await recruiter.agent.get(`${API}/dashboard/recruiter`);
    assert.equal(res.status, 200);
    const overview = res.body.data;

    assert.equal(overview.companyCount, 2);
    assert.equal(overview.jobs.open, await Job.countDocuments({ postedBy: recruiter.user._id, status: "open" }));
    assert.equal(overview.applications.total, 3);
    assert.equal(overview.applications.byStatus.interview, 1);
    assert.ok(overview.recentApplications.length > 0);
    assert.ok(overview.recentApplications[0].candidate.fullName);
    assert.ok(overview.topJobs.every((job) => job.status === "open"));

    const other = await otherRecruiter.agent.get(`${API}/dashboard/recruiter`);
    assert.equal(other.body.data.applications.total, 0);

    const asCandidate = await candidate.agent.get(`${API}/dashboard/recruiter`);
    assert.equal(asCandidate.status, 403);
  });
});
