import assert from "node:assert/strict";
import { after, before, describe, test } from "node:test";
import request from "supertest";
import { API, signUp, startTestServer, validJob } from "./helpers/testServer.js";

const CRON_SECRET = "test-cron-secret";

let app;
let stop;
let JobAlert;
let User;
let testOutbox;
let recruiter;
let companyId;

const dispatch = (secret = CRON_SECRET) =>
  request(app).get(`${API}/job-alerts/dispatch`).set("Authorization", `Bearer ${secret}`);

const postJob = async (overrides) =>
  (await recruiter.agent.post(`${API}/jobs`).send(validJob(companyId, overrides))).body.data.job;

before(async () => {
  process.env.CRON_SECRET = CRON_SECRET;
  ({ app, stop } = await startTestServer());
  ({ JobAlert } = await import("../src/modules/jobAlerts/jobAlert.model.js"));
  ({ User } = await import("../src/modules/users/user.model.js"));
  ({ testOutbox } = await import("../src/services/email.js"));

  recruiter = await signUp(app, { role: "recruiter" });
  companyId = (await recruiter.agent.post(`${API}/companies`).send({ name: "Alert Labs" })).body.data.company._id;
});

after(async () => {
  await stop();
});

describe("managing job alerts", () => {
  test("a candidate saves a search once, with a summary and a link back to it", async () => {
    const candidate = await signUp(app);
    const criteria = { q: "React", location: "Pune", workMode: ["remote", "hybrid"], salaryMin: 6 };

    const created = await candidate.agent.post(`${API}/job-alerts`).send({ criteria });
    assert.equal(created.status, 201);
    const { alert } = created.body.data;
    assert.equal(alert.frequency, "daily");
    assert.equal(alert.isActive, true);
    assert.equal(alert.summary, '"React" in Pune · Hybrid, Remote · ₹6 LPA+');
    assert.equal(alert.link, "/jobs?q=React&location=Pune&workMode=hybrid%2Cremote&salaryMin=6&sort=newest");

    // the same search in another order or letter case is a duplicate
    const duplicate = await candidate.agent
      .post(`${API}/job-alerts`)
      .send({ criteria: { ...criteria, q: "react", workMode: ["hybrid", "remote"] } });
    assert.equal(duplicate.status, 409);

    const invalid = await candidate.agent.post(`${API}/job-alerts`).send({ criteria, frequency: "hourly" });
    assert.equal(invalid.status, 400);

    const list = await candidate.agent.get(`${API}/job-alerts`);
    assert.equal(list.body.data.alerts.length, 1);
  });

  test("only candidates have alerts, and each can have at most ten", async () => {
    assert.equal((await request(app).get(`${API}/job-alerts`)).status, 401);
    assert.equal((await recruiter.agent.post(`${API}/job-alerts`).send({})).status, 403);

    const candidate = await signUp(app);
    for (let years = 0; years < 10; years += 1) {
      const res = await candidate.agent.post(`${API}/job-alerts`).send({ criteria: { experience: years } });
      assert.equal(res.status, 201);
    }
    const eleventh = await candidate.agent.post(`${API}/job-alerts`).send({ criteria: { experience: 10 } });
    assert.equal(eleventh.status, 400);
  });

  test("pausing, resuming, changing frequency and deleting", async () => {
    const candidate = await signUp(app);
    const other = await signUp(app);
    const { alert } = (await candidate.agent.post(`${API}/job-alerts`).send({ criteria: { q: "design" } })).body.data;

    const paused = await candidate.agent.patch(`${API}/job-alerts/${alert._id}`).send({ isActive: false, frequency: "weekly" });
    assert.equal(paused.body.data.alert.isActive, false);
    assert.equal(paused.body.data.alert.frequency, "weekly");

    // resuming starts from now, so jobs posted while paused aren't sent
    await JobAlert.updateOne({ _id: alert._id }, { lastCheckedAt: new Date("2026-01-01") });
    const resumed = await candidate.agent.patch(`${API}/job-alerts/${alert._id}`).send({ isActive: true });
    assert.ok(new Date(resumed.body.data.alert.lastCheckedAt) > new Date(Date.now() - 60_000));

    const empty = await candidate.agent.patch(`${API}/job-alerts/${alert._id}`).send({});
    assert.equal(empty.status, 400);

    // another candidate's alert looks like it doesn't exist
    assert.equal((await other.agent.patch(`${API}/job-alerts/${alert._id}`).send({ isActive: false })).status, 404);
    assert.equal((await other.agent.delete(`${API}/job-alerts/${alert._id}`)).status, 404);

    assert.equal((await candidate.agent.delete(`${API}/job-alerts/${alert._id}`)).status, 200);
    assert.equal((await candidate.agent.get(`${API}/job-alerts`)).body.data.alerts.length, 0);
  });
});

describe("sending job alerts", () => {
  test("only the scheduler can start a run", async () => {
    assert.equal((await request(app).get(`${API}/job-alerts/dispatch`)).status, 401);
    assert.equal((await dispatch("wrong-secret")).status, 401);
  });

  test("emails and notifies new matching jobs once, and skips suspended accounts", async () => {
    await JobAlert.deleteMany({});
    const candidate = await signUp(app);
    const suspended = await signUp(app);
    const criteria = { q: "kotlin", workMode: ["remote"] };

    const { alert } = (await candidate.agent.post(`${API}/job-alerts`).send({ criteria })).body.data;
    await suspended.agent.post(`${API}/job-alerts`).send({ criteria });
    await User.updateOne({ _id: suspended.user._id }, { status: "suspended" });

    // a fresh alert isn't due yet
    assert.deepEqual((await dispatch()).body.data, { checked: 0, sent: 0 });

    await postJob({ title: "Kotlin Engineer", skills: ["Kotlin"], workMode: "remote" });
    await postJob({ title: "Kotlin Developer", skills: ["Kotlin"], workMode: "onsite" });
    await postJob({ title: "Draft Kotlin Role", skills: ["Kotlin"], workMode: "remote", status: "draft" });
    await JobAlert.updateMany({}, { lastCheckedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) });

    testOutbox.length = 0;
    const run = await dispatch();
    assert.equal(run.status, 200);
    assert.deepEqual(run.body.data, { checked: 1, sent: 1 });

    assert.equal(testOutbox.length, 1);
    const [email] = testOutbox;
    assert.equal(email.to, candidate.credentials.email);
    assert.equal(email.subject, '1 new job for "kotlin" · Remote');
    assert.ok(email.text.includes("Kotlin Engineer"));
    assert.ok(!email.text.includes("Kotlin Developer"));
    assert.ok(!email.text.includes("Draft Kotlin Role"));

    const notifications = (await candidate.agent.get(`${API}/notifications`)).body.data.notifications;
    assert.equal(notifications[0].type, "job_alert");
    assert.equal(notifications[0].link, "/jobs?q=kotlin&workMode=remote&sort=newest");

    // the alert moved on: running again right away sends nothing
    const checked = await JobAlert.findById(alert._id);
    assert.ok(checked.lastCheckedAt > new Date(Date.now() - 60_000));
    assert.deepEqual((await dispatch()).body.data, { checked: 0, sent: 0 });
  });

  test("a due alert with no new jobs is checked without an email", async () => {
    await JobAlert.deleteMany({});
    const candidate = await signUp(app);
    await candidate.agent.post(`${API}/job-alerts`).send({ criteria: { q: "haskell" }, frequency: "weekly" });

    // weekly alerts aren't due after two days
    await JobAlert.updateMany({}, { lastCheckedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) });
    assert.deepEqual((await dispatch()).body.data, { checked: 0, sent: 0 });

    await JobAlert.updateMany({}, { lastCheckedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) });
    testOutbox.length = 0;
    assert.deepEqual((await dispatch()).body.data, { checked: 1, sent: 0 });
    assert.equal(testOutbox.length, 0);
  });
});

describe("similar jobs", () => {
  test("ranks other open jobs by shared title words and skills", async () => {
    const source = await postJob({ title: "Rust Systems Engineer", skills: ["Rust", "Linux"] });
    const close = await postJob({ title: "Senior Rust Engineer", skills: ["Rust", "Linux"] });
    const loose = await postJob({ title: "Linux Administrator", skills: ["Linux"] });
    await postJob({ title: "Chartered Accountant", skills: ["Tally"] });
    const draft = await postJob({ title: "Rust Systems Engineer II", skills: ["Rust"], status: "draft" });

    const res = await request(app).get(`${API}/jobs/${source._id}/similar`);
    assert.equal(res.status, 200);
    const ids = res.body.data.jobs.map((job) => job._id);
    assert.equal(ids[0], close._id);
    assert.ok(ids.includes(loose._id));
    assert.ok(!ids.includes(source._id));
    assert.ok(!ids.includes(draft._id));
    assert.ok(res.body.data.jobs.every((job) => job.title !== "Chartered Accountant"));
    assert.ok(res.body.data.jobs[0].summary);

    assert.equal((await request(app).get(`${API}/jobs/${draft._id}/similar`)).status, 404);
  });
});
