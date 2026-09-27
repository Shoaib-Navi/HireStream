import assert from "node:assert/strict";
import { after, before, describe, test } from "node:test";
import request from "supertest";
import { API, signUp, startTestServer, validJob } from "./helpers/testServer.js";

let app;
let stop;

before(async () => {
  ({ app, stop } = await startTestServer());
});

after(async () => {
  await stop();
});

describe("sitemap", () => {
  test("lists public pages, open jobs and companies, and nothing seeded or private", async () => {
    const { Job } = await import("../src/modules/jobs/job.model.js");
    const { appUrl } = (await import("../src/config/env.js")).env;
    const recruiter = await signUp(app, { role: "recruiter" });
    const company = (await recruiter.agent.post(`${API}/companies`).send({ name: "Mapped & Co" })).body.data.company;

    const open = (await recruiter.agent.post(`${API}/jobs`).send(validJob(company._id))).body.data.job;
    const draft = (await recruiter.agent.post(`${API}/jobs`).send(validJob(company._id, { status: "draft" }))).body.data.job;
    const seeded = await Job.create({
      ...validJob(company._id),
      company: company._id,
      postedBy: recruiter.user._id,
      source: "PUBLIC_SOURCE",
      externalId: "board-1",
    });

    const res = await request(app).get(`${API}/sitemap.xml`);
    assert.equal(res.status, 200);
    assert.match(res.headers["content-type"], /application\/xml/);
    assert.match(res.headers["cache-control"], /s-maxage=3600/);

    const xml = res.text;
    assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
    assert.ok(xml.includes(`<loc>${appUrl}/jobs</loc>`));
    assert.ok(xml.includes(`<loc>${appUrl}/jobs/${open._id}</loc><lastmod>`));
    assert.ok(xml.includes(`<loc>${appUrl}/companies/${company.slug}</loc>`));
    assert.ok(!xml.includes(draft._id));
    assert.ok(!xml.includes(seeded._id.toString()));
  });
});
