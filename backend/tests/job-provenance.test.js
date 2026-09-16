import assert from "node:assert/strict";
import { after, before, describe, test } from "node:test";
import request from "supertest";
import { API, signUp, startTestServer, validJob } from "./helpers/testServer.js";

let app;
let stop;
let Job;
let recruiter;
let companyId;

const seededJob = (overrides) => ({
  title: "Seeded Role",
  description: "A posting stored by the development seed, kept short on purpose.",
  employmentType: "full-time",
  workMode: "remote",
  location: "Remote",
  company: companyId,
  postedBy: recruiter.user._id,
  ...overrides,
});

before(async () => {
  ({ app, stop } = await startTestServer());
  ({ Job } = await import("../src/modules/jobs/job.model.js"));

  recruiter = await signUp(app, { role: "recruiter" });
  companyId = (await recruiter.agent.post(`${API}/companies`).send({ name: "Provenance Co" })).body.data.company._id;
});

after(async () => {
  await stop();
});

describe("seeded job provenance", () => {
  test("the same posting can't be stored twice for one source", async () => {
    await Job.create(seededJob({ source: "PUBLIC_SOURCE", externalId: "board-1", sourceUrl: "https://example.com/1" }));

    await assert.rejects(
      () => Job.create(seededJob({ source: "PUBLIC_SOURCE", externalId: "board-1" })),
      (error) => error.code === 11000,
      "a second row with the same source and external id should be rejected",
    );

    // the same external id from a different source is a different posting
    const other = await Job.create(seededJob({ source: "SYNTHETIC", externalId: "board-1" }));
    assert.equal(other.source, "SYNTHETIC");
  });

  test("jobs posted through the app are unaffected by the dedupe index", async () => {
    const first = await Job.create(seededJob({ title: "Unmarked One" }));
    const second = await Job.create(seededJob({ title: "Unmarked Two" }));

    assert.equal(first.source, undefined);
    assert.equal(second.externalId, undefined);
  });

  test("provenance reaches the job board so seeded rows can be told apart", async () => {
    await Job.create(
      seededJob({
        title: "Traceable Posting",
        source: "PUBLIC_SOURCE",
        externalId: "board-2",
        sourceUrl: "https://example.com/2",
        postedAt: new Date("2026-01-05"),
      }),
    );

    const res = await request(app).get(`${API}/jobs?q=Traceable`);
    const [job] = res.body.data.jobs;
    assert.equal(job.source, "PUBLIC_SOURCE");
    assert.equal(job.sourceUrl, "https://example.com/2");
    assert.ok(job.postedAt);
  });

  test("recruiters can't pass provenance fields through the API", async () => {
    const res = await recruiter.agent
      .post(`${API}/jobs`)
      .send({ ...validJob(companyId, { title: "Client Supplied" }), source: "PUBLIC_SOURCE", externalId: "spoofed", sourceUrl: "https://example.com/spoof" });

    assert.equal(res.status, 201);
    const created = await Job.findById(res.body.data.job._id).lean();
    assert.equal(created.source, undefined);
    assert.equal(created.externalId, undefined);
    assert.equal(created.sourceUrl, undefined);
  });
});
