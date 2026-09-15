import assert from "node:assert/strict";
import { after, before, describe, test } from "node:test";
import request from "supertest";
import { API, signUp, startTestServer, validJob } from "./helpers/testServer.js";

let app;
let stop;
let recruiter;
let otherRecruiter;
let candidate;
let companyId;
let otherCompanyId;

before(async () => {
  ({ app, stop } = await startTestServer());
  recruiter = await signUp(app, { role: "recruiter" });
  otherRecruiter = await signUp(app, { role: "recruiter" });
  candidate = await signUp(app);
});

after(async () => {
  await stop();
});

describe("companies", () => {
  test("recruiters create companies with unique slugs", async () => {
    const first = await recruiter.agent.post(`${API}/companies`).send({ name: "Acme Corp", website: "https://acme.test" });
    assert.equal(first.status, 201);
    assert.equal(first.body.data.company.slug, "acme-corp");
    companyId = first.body.data.company._id;

    const second = await otherRecruiter.agent.post(`${API}/companies`).send({ name: "Acme Corp" });
    assert.equal(second.status, 201);
    assert.equal(second.body.data.company.slug, "acme-corp-2");
    otherCompanyId = second.body.data.company._id;
  });

  test("candidates and guests cannot create companies", async () => {
    const asCandidate = await candidate.agent.post(`${API}/companies`).send({ name: "Nope" });
    assert.equal(asCandidate.status, 403);
    const asGuest = await request(app).post(`${API}/companies`).send({ name: "Nope" });
    assert.equal(asGuest.status, 401);
  });

  test("validates company fields", async () => {
    const res = await recruiter.agent.post(`${API}/companies`).send({ name: "Bad Site", website: "javascript:alert(1)" });
    assert.equal(res.status, 400);
  });

  test("only the owner can read and update a company", async () => {
    const read = await otherRecruiter.agent.get(`${API}/companies/mine/${companyId}`);
    assert.equal(read.status, 404);

    const update = await otherRecruiter.agent.patch(`${API}/companies/${companyId}`).send({ name: "Hacked" });
    assert.equal(update.status, 404);

    const ownUpdate = await recruiter.agent.patch(`${API}/companies/${companyId}`).send({ location: "Pune", size: "11-50" });
    assert.equal(ownUpdate.status, 200);
    assert.equal(ownUpdate.body.data.company.location, "Pune");
    assert.equal(ownUpdate.body.data.company.slug, "acme-corp");
  });

  test("lists only the recruiter's companies", async () => {
    const res = await recruiter.agent.get(`${API}/companies/mine`);
    assert.equal(res.status, 200);
    assert.equal(res.body.data.companies.length, 1);
    assert.equal(res.body.data.companies[0].openJobCount, 0);
  });

  test("logo upload rejects non-image files", async () => {
    const res = await recruiter.agent
      .put(`${API}/companies/${companyId}/logo`)
      .attach("file", Buffer.from("not an image"), { filename: "logo.txt", contentType: "text/plain" });
    assert.equal(res.status, 400);
  });
});

describe("jobs", () => {
  let jobId;
  let draftId;

  test("validates job posts and company ownership", async () => {
    const shortDescription = await recruiter.agent.post(`${API}/jobs`).send(validJob(companyId, { description: "Too short" }));
    assert.equal(shortDescription.status, 400);

    const badSalary = await recruiter.agent.post(`${API}/jobs`).send(validJob(companyId, { salary: { min: 20, max: 10 } }));
    assert.equal(badSalary.status, 400);

    const otherCompany = await recruiter.agent.post(`${API}/jobs`).send(validJob(otherCompanyId));
    assert.equal(otherCompany.status, 404);

    const asCandidate = await candidate.agent.post(`${API}/jobs`).send(validJob(companyId));
    assert.equal(asCandidate.status, 403);
  });

  test("recruiter posts open and draft jobs", async () => {
    const open = await recruiter.agent.post(`${API}/jobs`).send(validJob(companyId, { skills: ["React", "React", " Redux "] }));
    assert.equal(open.status, 201);
    assert.deepEqual(open.body.data.job.skills, ["React", "Redux"]);
    jobId = open.body.data.job._id;

    const draft = await recruiter.agent.post(`${API}/jobs`).send(validJob(companyId, { title: "Secret Draft Role", status: "draft" }));
    assert.equal(draft.status, 201);
    draftId = draft.body.data.job._id;

    await otherRecruiter.agent
      .post(`${API}/jobs`)
      .send(validJob(otherCompanyId, { title: "Remote Contract Designer", employmentType: "contract", workMode: "remote", location: "Delhi", salary: { min: 20, max: 25 } }));
  });

  test("public listing filters, paginates and hides drafts", async () => {
    const all = await request(app).get(`${API}/jobs`);
    assert.equal(all.status, 200);
    assert.equal(all.body.meta.total, 2);
    assert.ok(all.body.data.jobs.every((job) => job.title !== "Secret Draft Role"));
    assert.ok(all.body.data.jobs[0].summary);
    assert.ok(!("description" in all.body.data.jobs[0]));
    assert.ok(!("owner" in all.body.data.jobs[0].company));

    const remote = await request(app).get(`${API}/jobs?workMode=remote,onsite`);
    assert.equal(remote.body.meta.total, 1);

    const contract = await request(app).get(`${API}/jobs?employmentType=contract&employmentType=internship`);
    assert.equal(contract.body.meta.total, 1);

    const salary = await request(app).get(`${API}/jobs?salaryMin=15`);
    assert.equal(salary.body.meta.total, 1);

    const location = await request(app).get(`${API}/jobs?location=bangal`);
    assert.equal(location.body.meta.total, 1);

    const regexChars = await request(app).get(`${API}/jobs?q=${encodeURIComponent("(.*")}`);
    assert.equal(regexChars.status, 200);
    assert.equal(regexChars.body.meta.total, 0);

    const page = await request(app).get(`${API}/jobs?limit=1&page=2`);
    assert.equal(page.body.data.jobs.length, 1);
    assert.equal(page.body.meta.totalPages, 2);

    const invalid = await request(app).get(`${API}/jobs?workMode=space`);
    assert.equal(invalid.status, 400);
  });

  test("job details: public for open jobs, drafts only for the owner", async () => {
    const open = await request(app).get(`${API}/jobs/${jobId}`);
    assert.equal(open.status, 200);
    assert.equal(open.body.data.job.hasApplied, false);
    assert.equal(open.body.data.job.isAcceptingApplications, true);
    assert.equal(open.body.data.job.company.name, "Acme Corp");

    const draftAsGuest = await request(app).get(`${API}/jobs/${draftId}`);
    assert.equal(draftAsGuest.status, 404);

    const draftAsOwner = await recruiter.agent.get(`${API}/jobs/${draftId}`);
    assert.equal(draftAsOwner.status, 200);
    assert.equal(draftAsOwner.body.data.job.isOwner, true);

    const invalidId = await request(app).get(`${API}/jobs/abc`);
    assert.equal(invalidId.status, 400);
  });

  test("recruiter lists own jobs with status filter", async () => {
    const all = await recruiter.agent.get(`${API}/jobs/mine`);
    assert.equal(all.status, 200);
    assert.equal(all.body.meta.total, 2);

    const drafts = await recruiter.agent.get(`${API}/jobs/mine?status=draft`);
    assert.equal(drafts.body.meta.total, 1);

    const companies = await recruiter.agent.get(`${API}/companies/mine`);
    assert.equal(companies.body.data.companies[0].openJobCount, 1);
  });
});
