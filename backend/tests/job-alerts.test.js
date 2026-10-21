import assert from "node:assert/strict";
import { after, before, describe, test } from "node:test";
import request from "supertest";
import { API, signUp, startTestServer, validJob } from "./helpers/testServer.js";

const CRON_SECRET = "test-cron-secret";
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const ago = (ms) => new Date(Date.now() - ms);
// createdAt is immutable, so moving it back in time has to be allowed explicitly
const BACKDATE = { timestamps: false, overwriteImmutable: true };

let app;
let stop;
let Company;
let Job;
let JobAlert;
let User;
let testOutbox;
let recruiter;
let companyId;

const dispatch = (secret = CRON_SECRET) =>
  request(app).get(`${API}/job-alerts/dispatch`).set("Authorization", `Bearer ${secret}`);

// Alert emails only go to verified addresses
const verifiedCandidate = async () => {
  const candidate = await signUp(app);
  await User.updateOne({ _id: candidate.user._id }, { emailVerifiedAt: new Date() });
  return candidate;
};

const postJob = async (overrides) =>
  (await recruiter.agent.post(`${API}/jobs`).send(validJob(companyId, overrides))).body.data.job;

before(async () => {
  process.env.CRON_SECRET = CRON_SECRET;
  ({ app, stop } = await startTestServer());
  ({ Company } = await import("../src/modules/companies/company.model.js"));
  ({ Job } = await import("../src/modules/jobs/job.model.js"));
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
    const candidate = await verifiedCandidate();
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

    const candidate = await verifiedCandidate();
    for (let years = 0; years < 10; years += 1) {
      const res = await candidate.agent.post(`${API}/job-alerts`).send({ criteria: { experience: years } });
      assert.equal(res.status, 201);
    }
    const eleventh = await candidate.agent.post(`${API}/job-alerts`).send({ criteria: { experience: 10 } });
    assert.equal(eleventh.status, 400);
  });

  test("pausing, resuming, changing frequency and deleting", async () => {
    const candidate = await verifiedCandidate();
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
    const candidate = await verifiedCandidate();
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
    const candidate = await verifiedCandidate();
    await candidate.agent.post(`${API}/job-alerts`).send({ criteria: { q: "haskell" }, frequency: "weekly" });

    // weekly alerts aren't due after two days
    await JobAlert.updateMany({}, { lastCheckedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) });
    assert.deepEqual((await dispatch()).body.data, { checked: 0, sent: 0 });

    await JobAlert.updateMany({}, { lastCheckedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) });
    testOutbox.length = 0;
    assert.deepEqual((await dispatch()).body.data, { checked: 1, sent: 0 });
    assert.equal(testOutbox.length, 0);
  });

  test("a draft counts as new when it's published, not when it was written", async () => {
    await JobAlert.deleteMany({});
    const candidate = await verifiedCandidate();
    await candidate.agent.post(`${API}/job-alerts`).send({ criteria: { q: "elixir" } });

    // written well before the alert's last check, published after it
    const draft = await postJob({ title: "Elixir Engineer", skills: ["Elixir"], status: "draft" });
    await Job.updateOne({ _id: draft._id }, { createdAt: ago(5 * DAY) }, BACKDATE);
    await JobAlert.updateMany({}, { lastCheckedAt: ago(2 * DAY) });
    const statusUrl = `${API}/jobs/${draft._id}/status`;
    assert.equal((await recruiter.agent.patch(statusUrl).send({ status: "open" })).status, 200);

    testOutbox.length = 0;
    assert.deepEqual((await dispatch()).body.data, { checked: 1, sent: 1 });
    assert.ok(testOutbox[0].text.includes("Elixir Engineer"));

    // closing and reopening keeps the first publication date, so it isn't sent again
    const { publishedAt } = await Job.findById(draft._id).lean();
    await recruiter.agent.patch(statusUrl).send({ status: "closed" });
    await recruiter.agent.patch(statusUrl).send({ status: "open" });
    assert.deepEqual((await Job.findById(draft._id).lean()).publishedAt, publishedAt);
  });

  test("a suspended company can't publish its drafts", async () => {
    const owner = await signUp(app, { role: "recruiter" });
    const company = (await owner.agent.post(`${API}/companies`).send({ name: "Paused Labs" })).body.data.company;
    const draft = (await owner.agent.post(`${API}/jobs`).send(validJob(company._id, { status: "draft" }))).body.data.job;
    await Company.updateOne({ _id: company._id }, { status: "suspended" });

    const opened = await owner.agent.patch(`${API}/jobs/${draft._id}/status`).send({ status: "open" });
    assert.equal(opened.status, 403);
    const job = await Job.findById(draft._id).lean();
    assert.equal(job.status, "draft");
    assert.equal(job.publishedAt, undefined);
  });

  test("runs that overlap send each alert once", async () => {
    await JobAlert.deleteMany({});
    const candidate = await verifiedCandidate();
    await candidate.agent.post(`${API}/job-alerts`).send({ criteria: { q: "ocaml" } });
    await postJob({ title: "OCaml Engineer", skills: ["OCaml"] });
    await JobAlert.updateMany({}, { lastCheckedAt: ago(2 * DAY) });

    testOutbox.length = 0;
    const runs = await Promise.all([dispatch(), dispatch()]);
    assert.equal(runs.reduce((sent, run) => sent + run.body.data.sent, 0), 1);
    assert.equal(testOutbox.length, 1);
  });

  test("jobs saved before publication dates existed fall back to when they were created", async () => {
    await JobAlert.deleteMany({});
    const candidate = await verifiedCandidate();
    await candidate.agent.post(`${API}/job-alerts`).send({ criteria: { q: "fortran" } });

    const recent = await postJob({ title: "Fortran Developer", skills: ["Fortran"] });
    const old = await postJob({ title: "Fortran Maintainer", skills: ["Fortran"] });
    await Job.updateOne({ _id: recent._id }, { $unset: { publishedAt: 1 } });
    await Job.updateOne({ _id: old._id }, { $unset: { publishedAt: 1 }, createdAt: ago(5 * DAY) }, BACKDATE);
    await JobAlert.updateMany({}, { lastCheckedAt: ago(2 * DAY) });

    testOutbox.length = 0;
    assert.deepEqual((await dispatch()).body.data, { checked: 1, sent: 1 });
    assert.ok(testOutbox[0].text.includes("Fortran Developer"));
    assert.ok(!testOutbox[0].text.includes("Fortran Maintainer"));
  });

  test("a job published exactly at the last check was covered by that check", async () => {
    await JobAlert.deleteMany({});
    const candidate = await verifiedCandidate();
    const { alert } = (await candidate.agent.post(`${API}/job-alerts`).send({ criteria: { q: "erlang" } })).body.data;

    const lastCheckedAt = ago(2 * DAY);
    const covered = await postJob({ title: "Erlang Engineer", skills: ["Erlang"] });
    const fresh = await postJob({ title: "Erlang Developer", skills: ["Erlang"] });
    await Job.updateOne({ _id: covered._id }, { publishedAt: lastCheckedAt });
    await Job.updateOne({ _id: fresh._id }, { publishedAt: new Date(lastCheckedAt.getTime() + 1) });
    await JobAlert.updateOne({ _id: alert._id }, { lastCheckedAt });

    testOutbox.length = 0;
    assert.deepEqual((await dispatch()).body.data, { checked: 1, sent: 1 });
    assert.equal(testOutbox[0].subject, '1 new job for "erlang"');
    assert.ok(testOutbox[0].text.includes("Erlang Developer"));
  });

  test("a failed email is retried on the next run without a second notification", async () => {
    await JobAlert.deleteMany({});
    const candidate = await verifiedCandidate();
    const { alert } = (await candidate.agent.post(`${API}/job-alerts`).send({ criteria: { q: "cobol" } })).body.data;
    await postJob({ title: "COBOL Engineer", skills: ["COBOL"] });
    const lastCheckedAt = ago(2 * DAY);
    await JobAlert.updateOne({ _id: alert._id }, { lastCheckedAt });

    testOutbox.length = 0;
    testOutbox.failing = true;
    try {
      assert.deepEqual((await dispatch()).body.data, { checked: 1, sent: 0 });
    } finally {
      testOutbox.failing = false;
    }
    assert.deepEqual((await JobAlert.findById(alert._id)).lastCheckedAt, lastCheckedAt);
    assert.equal((await candidate.agent.get(`${API}/notifications`)).body.data.notifications.length, 0);

    assert.deepEqual((await dispatch()).body.data, { checked: 1, sent: 1 });
    assert.ok(testOutbox[0].text.includes("COBOL Engineer"));
    assert.equal((await candidate.agent.get(`${API}/notifications`)).body.data.notifications.length, 1);
  });

  test("an unverified address gets the notification but no email", async () => {
    await JobAlert.deleteMany({});
    const candidate = await signUp(app);
    await candidate.agent.post(`${API}/job-alerts`).send({ criteria: { q: "modula" } });
    await postJob({ title: "Modula Engineer", skills: ["Modula"] });
    await JobAlert.updateMany({}, { lastCheckedAt: ago(2 * DAY) });

    testOutbox.length = 0;
    assert.deepEqual((await dispatch()).body.data, { checked: 1, sent: 1 });
    assert.equal(testOutbox.length, 0);
    const notifications = (await candidate.agent.get(`${API}/notifications`)).body.data.notifications;
    assert.equal(notifications[0].type, "job_alert");
  });

  test("a job closed before the run isn't sent", async () => {
    await JobAlert.deleteMany({});
    const candidate = await verifiedCandidate();
    await candidate.agent.post(`${API}/job-alerts`).send({ criteria: { q: "clojure" } });
    const closed = await postJob({ title: "Clojure Engineer", skills: ["Clojure"] });
    await postJob({ title: "Clojure Developer", skills: ["Clojure"] });
    await recruiter.agent.patch(`${API}/jobs/${closed._id}/status`).send({ status: "closed" });
    await JobAlert.updateMany({}, { lastCheckedAt: ago(2 * DAY) });

    testOutbox.length = 0;
    assert.deepEqual((await dispatch()).body.data, { checked: 1, sent: 1 });
    assert.ok(testOutbox[0].text.includes("Clojure Developer"));
    assert.ok(!testOutbox[0].text.includes("Clojure Engineer"));
  });

  test("alerts fall due a little under a day or a week after the last check", async () => {
    await JobAlert.deleteMany({});
    const candidate = await verifiedCandidate();
    const create = async (criteria, frequency) =>
      (await candidate.agent.post(`${API}/job-alerts`).send({ criteria, frequency })).body.data.alert._id;
    const daily = await create({ q: "ada" }, "daily");
    const weekly = await create({ q: "pascal" }, "weekly");
    const checkedAgo = (id, ms) => JobAlert.updateOne({ _id: id }, { lastCheckedAt: ago(ms) });

    await Promise.all([checkedAgo(daily, 19 * HOUR), checkedAgo(weekly, 6 * DAY + 19 * HOUR)]);
    assert.deepEqual((await dispatch()).body.data, { checked: 0, sent: 0 });

    await Promise.all([checkedAgo(daily, 21 * HOUR), checkedAgo(weekly, 6 * DAY + 21 * HOUR)]);
    assert.deepEqual((await dispatch()).body.data, { checked: 2, sent: 0 });
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

  test("quotes and minus signs in a title don't narrow the match", async () => {
    const source = await postJob({ title: '"Lead" Clojure Engineer -Contract', skills: ["Clojure"] });
    const other = await postJob({ title: "Clojure Developer", skills: ["Clojure"] });

    const res = await request(app).get(`${API}/jobs/${source._id}/similar`);
    assert.ok(res.body.data.jobs.some((job) => job._id === other._id));
  });
});
