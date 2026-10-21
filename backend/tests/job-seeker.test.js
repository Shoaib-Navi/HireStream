import assert from "node:assert/strict";
import { after, before, describe, test } from "node:test";
import request from "supertest";
import { API, signUp, startTestServer, validJob } from "./helpers/testServer.js";

let app;
let stop;
let Application;
let CandidateProfile;
let Company;
let recruiter;
let candidate;
let otherCandidate;
let companyId;
let jobId;
let draftJobId;

before(async () => {
  ({ app, stop } = await startTestServer());
  ({ Application } = await import("../src/modules/applications/application.model.js"));
  ({ CandidateProfile } = await import("../src/modules/users/candidateProfile.model.js"));
  ({ Company } = await import("../src/modules/companies/company.model.js"));

  recruiter = await signUp(app, { role: "recruiter" });
  candidate = await signUp(app);
  otherCandidate = await signUp(app);

  const company = await recruiter.agent
    .post(`${API}/companies`)
    .send({ name: "Bright Works", industry: "Software", location: "Pune", description: "We build tools." });
  companyId = company.body.data.company._id;

  const job = await recruiter.agent.post(`${API}/jobs`).send(validJob(companyId));
  jobId = job.body.data.job._id;
  const draft = await recruiter.agent.post(`${API}/jobs`).send(validJob(companyId, { title: "Draft role", status: "draft" }));
  draftJobId = draft.body.data.job._id;

  await CandidateProfile.updateMany(
    { user: { $in: [candidate.user._id, otherCandidate.user._id] } },
    { resume: { url: "https://files.test/resume.pdf", originalName: "resume.pdf" } },
  );
});

after(async () => {
  await stop();
});

describe("saved jobs", () => {
  test("candidates save jobs idempotently", async () => {
    const first = await candidate.agent.put(`${API}/saved-jobs/${jobId}`);
    assert.equal(first.status, 200);
    const again = await candidate.agent.put(`${API}/saved-jobs/${jobId}`);
    assert.equal(again.status, 200);

    const list = await candidate.agent.get(`${API}/saved-jobs`);
    assert.equal(list.status, 200);
    assert.equal(list.body.meta.total, 1);
    assert.equal(list.body.data.jobs[0]._id, jobId);
    assert.equal(list.body.data.jobs[0].isSaved, true);
    assert.ok(list.body.data.jobs[0].summary);
  });

  test("job listing and details report isSaved for the viewer only", async () => {
    const mine = await candidate.agent.get(`${API}/jobs`);
    assert.equal(mine.body.data.jobs.find((job) => job._id === jobId).isSaved, true);

    const other = await otherCandidate.agent.get(`${API}/jobs`);
    assert.equal(other.body.data.jobs.find((job) => job._id === jobId).isSaved, false);

    const guest = await request(app).get(`${API}/jobs/${jobId}`);
    assert.equal(guest.body.data.job.isSaved, false);

    const details = await candidate.agent.get(`${API}/jobs/${jobId}`);
    assert.equal(details.body.data.job.isSaved, true);
  });

  test("drafts can't be saved and only candidates have saved jobs", async () => {
    const draft = await candidate.agent.put(`${API}/saved-jobs/${draftJobId}`);
    assert.equal(draft.status, 404);

    const asRecruiter = await recruiter.agent.put(`${API}/saved-jobs/${jobId}`);
    assert.equal(asRecruiter.status, 403);

    const asGuest = await request(app).get(`${API}/saved-jobs`);
    assert.equal(asGuest.status, 401);

    const invalid = await candidate.agent.put(`${API}/saved-jobs/not-an-id`);
    assert.equal(invalid.status, 400);
  });

  test("unsaving removes the job and is idempotent", async () => {
    const removed = await candidate.agent.delete(`${API}/saved-jobs/${jobId}`);
    assert.equal(removed.status, 200);
    const again = await candidate.agent.delete(`${API}/saved-jobs/${jobId}`);
    assert.equal(again.status, 200);

    const list = await candidate.agent.get(`${API}/saved-jobs`);
    assert.equal(list.body.meta.total, 0);
  });
});

describe("withdrawing applications", () => {
  let applicationId;

  test("candidate withdraws an in-progress application", async () => {
    const applied = await candidate.agent.post(`${API}/jobs/${jobId}/applications`).send({});
    applicationId = applied.body.data.application._id;

    const other = await otherCandidate.agent.patch(`${API}/applications/${applicationId}/withdraw`);
    assert.equal(other.status, 404);

    const asRecruiter = await recruiter.agent.patch(`${API}/applications/${applicationId}/withdraw`);
    assert.equal(asRecruiter.status, 403);

    const withdrawn = await candidate.agent.patch(`${API}/applications/${applicationId}/withdraw`);
    assert.equal(withdrawn.status, 200);
    assert.equal(withdrawn.body.data.application.status, "withdrawn");
    assert.deepEqual(
      withdrawn.body.data.application.statusHistory.map((entry) => entry.status),
      ["applied", "withdrawn"],
    );
  });

  test("withdrawn applications can't be withdrawn again or moved by the recruiter", async () => {
    const again = await candidate.agent.patch(`${API}/applications/${applicationId}/withdraw`);
    assert.equal(again.status, 400);

    const moved = await recruiter.agent.patch(`${API}/applications/${applicationId}/status`).send({ status: "shortlisted" });
    assert.equal(moved.status, 400);
  });

  test("hired applications can't be withdrawn", async () => {
    const applied = await otherCandidate.agent.post(`${API}/jobs/${jobId}/applications`).send({});
    const id = applied.body.data.application._id;
    await recruiter.agent.patch(`${API}/applications/${id}/status`).send({ status: "hired" });

    const res = await otherCandidate.agent.patch(`${API}/applications/${id}/withdraw`);
    assert.equal(res.status, 400);
    assert.equal((await Application.findById(id)).status, "hired");
  });

  test("application details include the job summary and full history for the candidate", async () => {
    const res = await candidate.agent.get(`${API}/applications/${applicationId}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.data.application.job.title, "React Developer");
    assert.equal(res.body.data.application.company.slug, "bright-works");
    assert.equal(res.body.data.application.statusHistory.length, 2);
  });
});

describe("public companies", () => {
  test("directory lists active companies with open job counts and search", async () => {
    await recruiter.agent.post(`${API}/companies`).send({ name: "Quiet Labs" });

    const all = await request(app).get(`${API}/companies`);
    assert.equal(all.status, 200);
    assert.equal(all.body.meta.total, 2);
    const bright = all.body.data.companies.find((company) => company.slug === "bright-works");
    assert.equal(bright.openJobCount, 1);
    assert.ok(!("owner" in bright));

    const search = await request(app).get(`${API}/companies?q=quiet`);
    assert.equal(search.body.meta.total, 1);
    assert.equal(search.body.data.companies[0].name, "Quiet Labs");
  });

  test("company page by slug, hidden when suspended", async () => {
    const res = await request(app).get(`${API}/companies/bright-works`);
    assert.equal(res.status, 200);
    assert.equal(res.body.data.company.name, "Bright Works");
    assert.equal(res.body.data.company.openJobCount, 1);

    const jobs = await request(app).get(`${API}/jobs?company=${res.body.data.company._id}`);
    assert.equal(jobs.body.meta.total, 1);

    await Company.updateOne({ slug: "quiet-labs" }, { status: "suspended" });
    const suspended = await request(app).get(`${API}/companies/quiet-labs`);
    assert.equal(suspended.status, 404);
    const directory = await request(app).get(`${API}/companies`);
    assert.equal(directory.body.meta.total, 1);

    const invalid = await request(app).get(`${API}/companies/${encodeURIComponent("bad slug!")}`);
    assert.equal(invalid.status, 400);
  });

  test("recruiter routes still work next to the slug route", async () => {
    const mine = await recruiter.agent.get(`${API}/companies/mine`);
    assert.equal(mine.status, 200);
    assert.equal(mine.body.data.companies.length, 2);
  });
});
