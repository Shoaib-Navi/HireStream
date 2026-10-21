import assert from "node:assert/strict";
import { after, before, describe, test } from "node:test";
import request from "supertest";
import { API, signUp, startTestServer, validJob } from "./helpers/testServer.js";

let app;
let stop;
let User;
let CandidateProfile;
let admin;
let recruiter;
let candidate;
let companyId;
let openJobId;

const asAdmin = async (app) => {
  const account = await signUp(app, { role: "recruiter" });
  await User.updateOne({ _id: account.user._id }, { role: "admin" });
  return account;
};

before(async () => {
  ({ app, stop } = await startTestServer());
  ({ User } = await import("../src/modules/users/user.model.js"));
  ({ CandidateProfile } = await import("../src/modules/users/candidateProfile.model.js"));

  admin = await asAdmin(app);
  recruiter = await signUp(app, { role: "recruiter" });
  candidate = await signUp(app);
  await CandidateProfile.updateOne(
    { user: candidate.user._id },
    { resume: { url: "https://files.test/resume.pdf", originalName: "resume.pdf" } },
  );

  companyId = (await recruiter.agent.post(`${API}/companies`).send({ name: "Atlas Robotics" })).body.data.company._id;
  openJobId = (await recruiter.agent.post(`${API}/jobs`).send(validJob(companyId, { title: "Controls Engineer" }))).body.data.job._id;
});

after(async () => {
  await stop();
});

describe("admin access", () => {
  test("only admins can reach the panel", async () => {
    assert.equal((await request(app).get(`${API}/admin/overview`)).status, 401);
    assert.equal((await recruiter.agent.get(`${API}/admin/overview`)).status, 403);
    assert.equal((await candidate.agent.get(`${API}/admin/users`)).status, 403);
    assert.equal((await admin.agent.get(`${API}/admin/overview`)).status, 200);
  });
});

describe("platform overview", () => {
  test("summarizes users, companies, jobs and applications", async () => {
    const res = await admin.agent.get(`${API}/admin/overview`);
    const data = res.body.data;

    assert.equal(data.users.total, await User.countDocuments());
    assert.equal(data.users.byRole.admin, 1);
    assert.equal(data.users.byRole.recruiter, 1);
    assert.equal(data.companies.total, 1);
    assert.equal(data.companies.unverified, 1);
    assert.equal(data.jobs.byStatus.open, 1);
    assert.equal(data.jobs.byStatus.draft, 0);
    assert.equal(data.applications.total, 0);
    assert.equal(data.recentUsers.length, 3);
    assert.equal(data.recentJobs[0].title, "Controls Engineer");
    assert.equal(data.recentJobs[0].company.name, "Atlas Robotics");
  });
});

describe("managing users", () => {
  test("lists users with search and filters", async () => {
    const recruiters = await admin.agent.get(`${API}/admin/users?role=recruiter`);
    assert.equal(recruiters.body.meta.total, 1);
    assert.equal(recruiters.body.data.users[0].email, recruiter.credentials.email);
    assert.ok(!("password" in recruiters.body.data.users[0]));

    const search = await admin.agent.get(`${API}/admin/users?q=${encodeURIComponent(candidate.credentials.email)}`);
    assert.equal(search.body.meta.total, 1);

    const invalidRole = await admin.agent.get(`${API}/admin/users?role=wizard`);
    assert.equal(invalidRole.status, 400);
  });

  test("suspending signs the user out and blocks logging in", async () => {
    const suspended = await admin.agent.patch(`${API}/admin/users/${candidate.user._id}/status`).send({ status: "suspended" });
    assert.equal(suspended.status, 200);
    assert.equal(suspended.body.data.user.status, "suspended");

    assert.equal((await candidate.agent.get(`${API}/auth/me`)).status, 401);
    const login = await request(app)
      .post(`${API}/auth/login`)
      .send({ email: candidate.credentials.email, password: candidate.credentials.password });
    assert.equal(login.status, 403);

    const restored = await admin.agent.patch(`${API}/admin/users/${candidate.user._id}/status`).send({ status: "active" });
    assert.equal(restored.body.data.user.status, "active");

    const loginAgain = await request(app)
      .post(`${API}/auth/login`)
      .send({ email: candidate.credentials.email, password: candidate.credentials.password });
    assert.equal(loginAgain.status, 200);
    candidate.agent = request.agent(app);
    await candidate.agent.post(`${API}/auth/login`).send({ email: candidate.credentials.email, password: candidate.credentials.password });
  });

  test("admins can't suspend themselves or each other", async () => {
    const self = await admin.agent.patch(`${API}/admin/users/${admin.user._id}/status`).send({ status: "suspended" });
    assert.equal(self.status, 400);

    const otherAdmin = await asAdmin(app);
    const other = await admin.agent.patch(`${API}/admin/users/${otherAdmin.user._id}/status`).send({ status: "suspended" });
    assert.equal(other.status, 403);
  });
});

describe("managing companies", () => {
  test("verifying and suspending a company", async () => {
    const verified = await admin.agent.patch(`${API}/admin/companies/${companyId}`).send({ isVerified: true });
    assert.equal(verified.status, 200);
    assert.equal(verified.body.data.company.isVerified, true);
    assert.equal(verified.body.data.company.owner.email, recruiter.credentials.email);

    const listed = await admin.agent.get(`${API}/admin/companies?isVerified=true`);
    assert.equal(listed.body.meta.total, 1);
    assert.equal(listed.body.data.companies[0].jobCount, 1);

    const suspended = await admin.agent.patch(`${API}/admin/companies/${companyId}`).send({ status: "suspended" });
    assert.equal(suspended.body.data.company.status, "suspended");

    // jobs of a suspended company disappear from the public board
    const board = await request(app).get(`${API}/jobs?q=controls`);
    assert.equal(board.body.meta.total, 0);
    const apply = await candidate.agent.post(`${API}/jobs/${openJobId}/applications`).send({});
    assert.equal(apply.status, 404);

    await admin.agent.patch(`${API}/admin/companies/${companyId}`).send({ status: "active" });
    const empty = await admin.agent.patch(`${API}/admin/companies/${companyId}`).send({});
    assert.equal(empty.status, 400);
  });
});

describe("managing jobs", () => {
  test("lists, closes and deletes jobs", async () => {
    const listed = await admin.agent.get(`${API}/admin/jobs?status=open`);
    assert.equal(listed.body.meta.total, 1);
    assert.equal(listed.body.data.jobs[0].postedBy.email, recruiter.credentials.email);

    const closed = await admin.agent.patch(`${API}/admin/jobs/${openJobId}/status`).send({ status: "closed" });
    assert.equal(closed.status, 200);
    assert.ok(closed.body.data.job.closedAt);
    await admin.agent.patch(`${API}/admin/jobs/${openJobId}/status`).send({ status: "open" });

    const spare = (await recruiter.agent.post(`${API}/jobs`).send(validJob(companyId, { title: "Temporary role" }))).body.data.job._id;
    const deleted = await admin.agent.delete(`${API}/admin/jobs/${spare}`);
    assert.equal(deleted.status, 200);
    assert.equal((await request(app).get(`${API}/jobs/${spare}`)).status, 404);
  });

  test("jobs with applicants can't be deleted", async () => {
    await candidate.agent.post(`${API}/jobs/${openJobId}/applications`).send({});

    const deleted = await admin.agent.delete(`${API}/admin/jobs/${openJobId}`);
    assert.equal(deleted.status, 409);

    const missing = await admin.agent.delete(`${API}/admin/jobs/${admin.user._id}`);
    assert.equal(missing.status, 404);
  });
});
