import assert from "node:assert/strict";
import { after, before, beforeEach, describe, test } from "node:test";
import request from "supertest";
import { API, signUp, startTestServer, validJob } from "./helpers/testServer.js";

let app;
let stop;
let testOutbox;
let AuthToken;
let CandidateProfile;

const TOKEN_PATTERN = /token=([a-f0-9]{64})/;

const lastEmailTo = (email) => testOutbox.findLast((message) => message.to === email);
const tokenFrom = (message) => message?.text.match(TOKEN_PATTERN)?.[1];

before(async () => {
  ({ app, stop } = await startTestServer());
  ({ testOutbox } = await import("../src/services/email.js"));
  ({ AuthToken } = await import("../src/modules/auth/authToken.model.js"));
  ({ CandidateProfile } = await import("../src/modules/users/candidateProfile.model.js"));
});

after(async () => {
  await stop();
});

beforeEach(() => {
  testOutbox.length = 0;
});

describe("email verification", () => {
  test("sign up sends a single-use verification link", async () => {
    const { agent, credentials } = await signUp(app);
    const token = tokenFrom(lastEmailTo(credentials.email));
    assert.ok(token, "verification email contains a token");

    const verified = await request(app).post(`${API}/auth/verify-email`).send({ token });
    assert.equal(verified.status, 200);
    assert.equal(verified.body.data.user.isEmailVerified, true);

    const me = await agent.get(`${API}/auth/me`);
    assert.equal(me.body.data.user.isEmailVerified, true);

    const reused = await request(app).post(`${API}/auth/verify-email`).send({ token });
    assert.equal(reused.status, 400);

    const resendWhenVerified = await agent.post(`${API}/auth/verify-email/resend`);
    assert.equal(resendWhenVerified.status, 400);
  });

  test("resending invalidates the previous link", async () => {
    const { agent, credentials } = await signUp(app);
    const firstToken = tokenFrom(lastEmailTo(credentials.email));

    const resent = await agent.post(`${API}/auth/verify-email/resend`);
    assert.equal(resent.status, 200);
    const secondToken = tokenFrom(lastEmailTo(credentials.email));
    assert.notEqual(firstToken, secondToken);

    const oldLink = await request(app).post(`${API}/auth/verify-email`).send({ token: firstToken });
    assert.equal(oldLink.status, 400);
    const newLink = await request(app).post(`${API}/auth/verify-email`).send({ token: secondToken });
    assert.equal(newLink.status, 200);
  });

  test("malformed and expired links are rejected", async () => {
    const malformed = await request(app).post(`${API}/auth/verify-email`).send({ token: "not-a-token" });
    assert.equal(malformed.status, 400);

    const { credentials, user } = await signUp(app);
    const token = tokenFrom(lastEmailTo(credentials.email));
    await AuthToken.updateMany({ user: user._id }, { expiresAt: new Date(Date.now() - 1000) });

    const expired = await request(app).post(`${API}/auth/verify-email`).send({ token });
    assert.equal(expired.status, 400);

    const guestResend = await request(app).post(`${API}/auth/verify-email/resend`);
    assert.equal(guestResend.status, 401);
  });
});

describe("password reset", () => {
  test("unknown emails get the same response and no email", async () => {
    const res = await request(app).post(`${API}/auth/forgot-password`).send({ email: "nobody@test.com" });
    assert.equal(res.status, 200);
    assert.equal(testOutbox.length, 0);
  });

  test("reset link sets a new password, signs out sessions and works once", async () => {
    const { agent, credentials } = await signUp(app);

    const requested = await request(app).post(`${API}/auth/forgot-password`).send({ email: credentials.email.toUpperCase() });
    assert.equal(requested.status, 200);
    const token = tokenFrom(lastEmailTo(credentials.email));
    assert.ok(token);

    const weak = await request(app).post(`${API}/auth/reset-password`).send({ token, password: "short" });
    assert.equal(weak.status, 400);

    const reset = await request(app).post(`${API}/auth/reset-password`).send({ token, password: "NewPassword456" });
    assert.equal(reset.status, 200);

    const oldSession = await agent.get(`${API}/auth/me`);
    assert.equal(oldSession.status, 401);

    const oldPassword = await request(app).post(`${API}/auth/login`).send({ email: credentials.email, password: credentials.password });
    assert.equal(oldPassword.status, 401);

    const newPassword = await request(app).post(`${API}/auth/login`).send({ email: credentials.email, password: "NewPassword456" });
    assert.equal(newPassword.status, 200);
    assert.equal(newPassword.body.data.user.isEmailVerified, true);

    const reused = await request(app).post(`${API}/auth/reset-password`).send({ token, password: "AnotherPass789" });
    assert.equal(reused.status, 400);
  });
});

describe("change password", () => {
  test("requires the current password and keeps only the current session", async () => {
    const { agent, credentials } = await signUp(app);
    const otherDevice = request.agent(app);
    await otherDevice.post(`${API}/auth/login`).send({ email: credentials.email, password: credentials.password });

    const wrong = await agent.patch(`${API}/auth/password`).send({ currentPassword: "WrongPass123", newPassword: "NewPassword456" });
    assert.equal(wrong.status, 400);
    assert.equal(wrong.body.errors[0].field, "currentPassword");

    const same = await agent
      .patch(`${API}/auth/password`)
      .send({ currentPassword: credentials.password, newPassword: credentials.password });
    assert.equal(same.status, 400);

    const changed = await agent.patch(`${API}/auth/password`).send({ currentPassword: credentials.password, newPassword: "NewPassword456" });
    assert.equal(changed.status, 200);

    assert.equal((await agent.get(`${API}/auth/me`)).status, 200);
    assert.equal((await otherDevice.get(`${API}/auth/me`)).status, 401);
  });
});

describe("notifications", () => {
  let recruiter;
  let candidate;
  let applicationId;

  before(async () => {
    recruiter = await signUp(app, { role: "recruiter" });
    candidate = await signUp(app);
    await CandidateProfile.updateOne(
      { user: candidate.user._id },
      { resume: { url: "https://files.test/resume.pdf", originalName: "resume.pdf" } },
    );

    const companyId = (await recruiter.agent.post(`${API}/companies`).send({ name: "Notify Labs" })).body.data.company._id;
    const jobId = (await recruiter.agent.post(`${API}/jobs`).send(validJob(companyId, { title: "Platform Engineer" }))).body.data.job._id;
    applicationId = (await candidate.agent.post(`${API}/jobs/${jobId}/applications`).send({})).body.data.application._id;
  });

  test("recruiter is notified about new applicants", async () => {
    const res = await recruiter.agent.get(`${API}/notifications`);
    assert.equal(res.status, 200);
    assert.equal(res.body.meta.unreadCount, 1);

    const [notification] = res.body.data.notifications;
    assert.equal(notification.type, "application_received");
    assert.match(notification.title, /Platform Engineer/);
    assert.equal(notification.link, `/recruiter/applications/${applicationId}`);
  });

  test("candidate gets a notification and an email when the status changes", async () => {
    await recruiter.agent
      .patch(`${API}/applications/${applicationId}/status`)
      .send({ status: "interview", note: "Are you free on Monday?" });

    const res = await candidate.agent.get(`${API}/notifications?unread=true`);
    const [notification] = res.body.data.notifications;
    assert.equal(notification.type, "application_status");
    assert.match(notification.title, /interview/i);
    assert.equal(notification.body, "Are you free on Monday?");
    assert.equal(notification.link, `/dashboard/applications/${applicationId}`);

    const email = lastEmailTo(candidate.credentials.email);
    assert.ok(email);
    assert.match(email.text, /Are you free on Monday\?/);
    assert.match(email.html, /Notify Labs/);
  });

  test("unchanged status sends nothing", async () => {
    await recruiter.agent.patch(`${API}/applications/${applicationId}/status`).send({ status: "interview" });
    assert.equal(testOutbox.length, 0);
  });

  test("notifications can be marked read only by their owner", async () => {
    const list = await candidate.agent.get(`${API}/notifications`);
    const notificationId = list.body.data.notifications[0]._id;

    const byOther = await recruiter.agent.patch(`${API}/notifications/${notificationId}/read`);
    assert.equal(byOther.status, 404);

    const read = await candidate.agent.patch(`${API}/notifications/${notificationId}/read`);
    assert.equal(read.status, 200);
    assert.ok(read.body.data.notification.readAt);

    const after = await candidate.agent.get(`${API}/notifications`);
    assert.equal(after.body.meta.unreadCount, 0);

    const guest = await request(app).get(`${API}/notifications`);
    assert.equal(guest.status, 401);
  });

  test("withdrawing notifies the recruiter, and read-all clears the badge", async () => {
    await candidate.agent.patch(`${API}/applications/${applicationId}/withdraw`);

    const unread = await recruiter.agent.get(`${API}/notifications?unread=true`);
    assert.equal(unread.body.data.notifications[0].type, "application_withdrawn");
    assert.equal(unread.body.meta.unreadCount, 2);

    const readAll = await recruiter.agent.patch(`${API}/notifications/read-all`);
    assert.equal(readAll.body.data.updated, 2);

    const after = await recruiter.agent.get(`${API}/notifications`);
    assert.equal(after.body.meta.unreadCount, 0);
    assert.equal(after.body.meta.total, 2);
  });
});
