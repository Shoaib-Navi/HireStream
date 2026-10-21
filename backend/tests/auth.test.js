import assert from "node:assert/strict";
import { after, before, describe, test } from "node:test";
import request from "supertest";
import { API, signUp, startTestServer } from "./helpers/testServer.js";

let app;
let stop;

before(async () => {
  ({ app, stop } = await startTestServer());
});

after(async () => {
  await stop();
});

describe("auth", () => {
  test("health check responds", async () => {
    const res = await request(app).get(`${API}/health`);
    assert.equal(res.status, 200);
    assert.equal(res.body.data.status, "ok");
  });

  test("register signs the user in and never exposes secrets", async () => {
    const { agent, user } = await signUp(app, { email: "New.User@Test.com" });

    assert.equal(user.email, "new.user@test.com");
    assert.equal(user.role, "candidate");
    assert.equal(user.isEmailVerified, false);
    assert.ok(!("password" in user));
    assert.ok(!("tokenVersion" in user));

    const me = await agent.get(`${API}/auth/me`);
    assert.equal(me.status, 200);
    assert.equal(me.body.data.user.email, "new.user@test.com");
  });

  test("session cookie is httpOnly and SameSite=Lax outside production", async () => {
    const res = await request(app).post(`${API}/auth/register`).send({
      fullName: "Cookie Check",
      email: "cookie@test.com",
      phone: "9876543210",
      password: "Password123",
      role: "recruiter",
    });
    const cookie = res.headers["set-cookie"]?.[0] ?? "";
    assert.match(cookie, /HttpOnly/i);
    assert.match(cookie, /SameSite=Lax/i);
  });

  test("rejects duplicate emails regardless of letter case", async () => {
    await signUp(app, { email: "dupe@test.com" });
    const res = await request(app).post(`${API}/auth/register`).send({
      fullName: "Dupe",
      email: "DUPE@test.com",
      phone: "9876543210",
      password: "Password123",
      role: "candidate",
    });
    assert.equal(res.status, 409);
  });

  test("rejects admin sign up, weak passwords and invalid emails", async () => {
    const base = { fullName: "Someone", email: "someone@test.com", phone: "9876543210", password: "Password123", role: "candidate" };

    const admin = await request(app).post(`${API}/auth/register`).send({ ...base, role: "admin" });
    assert.equal(admin.status, 400);

    const weak = await request(app).post(`${API}/auth/register`).send({ ...base, password: "password" });
    assert.equal(weak.status, 400);
    assert.match(weak.body.message, /letter and one number/);

    const badEmail = await request(app).post(`${API}/auth/register`).send({ ...base, email: "nope" });
    assert.equal(badEmail.status, 400);
    assert.ok(Array.isArray(badEmail.body.errors));
  });

  test("login works with any email letter case and rejects bad credentials", async () => {
    const { credentials } = await signUp(app, { email: "login@test.com" });

    const wrong = await request(app).post(`${API}/auth/login`).send({ email: credentials.email, password: "Wrong1234" });
    assert.equal(wrong.status, 401);

    const unknown = await request(app).post(`${API}/auth/login`).send({ email: "ghost@test.com", password: "Wrong1234" });
    assert.equal(unknown.status, 401);

    const injection = await request(app).post(`${API}/auth/login`).send({ email: { $gt: "" }, password: "Password123" });
    assert.equal(injection.status, 400);

    const ok = await request(app).post(`${API}/auth/login`).send({ email: "LOGIN@test.com", password: credentials.password });
    assert.equal(ok.status, 200);
    assert.ok(!("password" in ok.body.data.user));
  });

  test("logout ends the session", async () => {
    const { agent } = await signUp(app);
    const logout = await agent.post(`${API}/auth/logout`);
    assert.equal(logout.status, 200);
    const me = await agent.get(`${API}/auth/me`);
    assert.equal(me.status, 401);
  });

  test("tampered tokens are rejected", async () => {
    const res = await request(app).get(`${API}/auth/me`).set("Cookie", "token=not.a.real.jwt");
    assert.equal(res.status, 401);
  });

  test("suspended users lose access and cannot log in", async () => {
    const { User } = await import("../src/modules/users/user.model.js");
    const { agent, user, credentials } = await signUp(app);
    await User.updateOne({ _id: user._id }, { status: "suspended" });

    const me = await agent.get(`${API}/auth/me`);
    assert.equal(me.status, 403);

    const login = await request(app).post(`${API}/auth/login`).send({ email: credentials.email, password: credentials.password });
    assert.equal(login.status, 403);
  });

  test("changing tokenVersion signs out existing sessions", async () => {
    const { User } = await import("../src/modules/users/user.model.js");
    const { agent, user } = await signUp(app);
    await User.updateOne({ _id: user._id }, { $inc: { tokenVersion: 1 } });

    const me = await agent.get(`${API}/auth/me`);
    assert.equal(me.status, 401);
  });

  test("unknown routes return JSON 404 and malformed JSON returns 400", async () => {
    const missing = await request(app).get(`${API}/nope`);
    assert.equal(missing.status, 404);
    assert.equal(missing.body.success, false);

    const malformed = await request(app).post(`${API}/auth/login`).set("Content-Type", "application/json").send("{bad");
    assert.equal(malformed.status, 400);
  });
});
