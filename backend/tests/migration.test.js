import assert from "node:assert/strict";
import { after, before, describe, test } from "node:test";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import request from "supertest";
import { API, startTestServer } from "./helpers/testServer.js";

let app;
let stop;
let db;
let runMigrations;

const newId = () => new mongoose.Types.ObjectId();

before(async () => {
  ({ app, stop } = await startTestServer());
  ({ runMigrations } = await import("../src/migrations/runner.js"));
  db = mongoose.connection.db;
});

after(async () => {
  await stop();
});

describe("migration 001 (v1 -> v2)", () => {
  test("converts v1 data and keeps it usable through the API", async () => {
    // start from an empty database without v2 indexes, like a real v1 deployment
    await db.dropDatabase();

    const password = await bcrypt.hash("oldpass", 10);
    const createdAt = new Date("2025-01-01");
    const studentId = newId();
    const recruiterId = newId();
    const companyId = newId();
    const jobId = newId();
    const applicationId = newId();

    await db.collection("users").insertMany([
      {
        _id: studentId,
        fullname: "Old Student",
        email: "Old.Student@Test.com",
        phoneNumber: 9876543210,
        password,
        role: "student",
        profile: {
          bio: "Hello",
          skills: ["React", " Node "],
          resume: "https://files.test/resume.pdf",
          resumeOriginalName: "cv.pdf",
          profilePhoto: "https://files.test/photo.png",
        },
        createdAt,
        updatedAt: createdAt,
      },
      {
        _id: recruiterId,
        fullname: "Old Recruiter",
        email: "recruiter@test.com",
        phoneNumber: 9123456780,
        password,
        role: "recruiter",
        profile: { skills: [], profilePhoto: "" },
        createdAt,
        updatedAt: createdAt,
      },
    ]);

    await db.collection("companies").createIndex({ name: 1 }, { unique: true });
    await db.collection("companies").insertOne({
      _id: companyId,
      name: "Old Company Pvt Ltd",
      description: "Makes things",
      website: "https://old.test",
      location: "Pune",
      logo: "https://files.test/logo.png",
      userId: recruiterId,
      createdAt,
      updatedAt: createdAt,
    });

    await db.collection("jobs").insertOne({
      _id: jobId,
      title: "React Developer",
      description: "Build delightful interfaces",
      requirements: ["React", " Redux "],
      salary: 12,
      experienceLevel: 2,
      location: "Remote",
      jobType: "Part-time",
      position: 3,
      company: companyId,
      created_by: recruiterId,
      applications: [applicationId],
      createdAt,
      updatedAt: createdAt,
    });

    await db.collection("applications").insertMany([
      { _id: applicationId, job: jobId, applicant: studentId, status: "accepted", createdAt, updatedAt: new Date("2025-01-05") },
      // duplicate of the first application (v1 allowed these)
      { _id: newId(), job: jobId, applicant: studentId, status: "pending", createdAt: new Date("2025-01-02"), updatedAt: new Date("2025-01-02") },
      // application for a job that no longer exists
      { _id: newId(), job: newId(), applicant: studentId, status: "pending", createdAt, updatedAt: createdAt },
    ]);

    await runMigrations({ log: () => {} });

    const user = await db.collection("users").findOne({ _id: studentId });
    assert.equal(user.fullName, "Old Student");
    assert.equal(user.email, "old.student@test.com");
    assert.equal(user.phone, "9876543210");
    assert.equal(user.role, "candidate");
    assert.equal(user.avatar.url, "https://files.test/photo.png");
    assert.ok(user.emailVerifiedAt);
    assert.ok(!("fullname" in user) && !("profile" in user) && !("phoneNumber" in user));

    const profile = await db.collection("candidate_profiles").findOne({ user: studentId });
    assert.equal(profile.bio, "Hello");
    assert.deepEqual(profile.skills, ["React", "Node"]);
    assert.equal(profile.resume.originalName, "cv.pdf");
    assert.equal(await db.collection("candidate_profiles").countDocuments({ user: recruiterId }), 0);

    const company = await db.collection("companies").findOne({ _id: companyId });
    assert.equal(company.slug, "old-company-pvt-ltd");
    assert.ok(company.owner.equals(recruiterId));
    assert.equal(company.logo.url, "https://files.test/logo.png");
    assert.ok(!("userId" in company));
    const companyIndexes = await db.collection("companies").indexes();
    assert.ok(!companyIndexes.some((index) => index.name === "name_1"));

    const job = await db.collection("jobs").findOne({ _id: jobId });
    assert.equal(job.employmentType, "part-time");
    assert.equal(job.workMode, "remote");
    assert.deepEqual(job.salary, { min: 12, max: 12, currency: "INR" });
    assert.equal(job.experience.min, 2);
    assert.equal(job.openings, 3);
    assert.equal(job.applicationCount, 1);
    assert.deepEqual(job.requirements, ["React", "Redux"]);
    assert.ok(job.postedBy.equals(recruiterId));
    assert.ok(!("created_by" in job) && !("jobType" in job) && !("applications" in job));

    const applications = await db.collection("applications").find().toArray();
    assert.equal(applications.length, 1);
    assert.equal(applications[0].status, "shortlisted");
    assert.deepEqual(applications[0].statusHistory.map((entry) => entry.status), ["applied", "shortlisted"]);
    assert.ok(applications[0].candidate.equals(studentId));
    assert.ok(applications[0].company.equals(companyId));
    assert.equal(applications[0].resume.originalName, "cv.pdf");
    assert.equal(await db.collection("migration_001_removed_applications").countDocuments(), 2);
    assert.equal(await db.collection("backup_001_users").countDocuments(), 2);

    // migrated accounts keep their passwords and data
    const agent = request.agent(app);
    const login = await agent.post(`${API}/auth/login`).send({ email: "old.student@test.com", password: "oldpass" });
    assert.equal(login.status, 200);

    const mine = await agent.get(`${API}/applications/mine`);
    assert.equal(mine.status, 200);
    assert.equal(mine.body.data.applications[0].job.title, "React Developer");

    const jobs = await request(app).get(`${API}/jobs`);
    assert.equal(jobs.body.meta.total, 1);
    assert.equal(jobs.body.data.jobs[0].company.slug, "old-company-pvt-ltd");

    // running again changes nothing
    await runMigrations({ log: () => {} });
    assert.equal(await db.collection("migrations").countDocuments(), 1);
    assert.equal(await db.collection("applications").countDocuments(), 1);
  });

  test("stops when two accounts share an email in different letter case", async () => {
    await db.dropDatabase();
    const password = await bcrypt.hash("oldpass", 10);
    await db.collection("users").insertMany([
      { fullname: "One", email: "same@test.com", password, role: "student" },
      { fullname: "Two", email: "SAME@test.com", password, role: "student" },
    ]);

    await assert.rejects(runMigrations({ log: () => {} }), /letter case/);
    assert.equal(await db.collection("migrations").countDocuments(), 0);
  });
});
