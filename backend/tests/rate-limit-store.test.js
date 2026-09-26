import assert from "node:assert/strict";
import { after, before, describe, test } from "node:test";
import { startTestServer } from "./helpers/testServer.js";

let stop;
let MongoRateLimitStore;
let RateLimit;

before(async () => {
  ({ stop } = await startTestServer());
  ({ MongoRateLimitStore, RateLimit } = await import("../src/middleware/rateLimitStore.js"));
});

after(async () => {
  await stop();
});

const createStore = (prefix, windowMs = 60_000) => {
  const store = new MongoRateLimitStore(prefix);
  store.init({ windowMs });
  return store;
};

describe("shared rate limit store", () => {
  test("counts hits per client, and each limiter keeps its own count", async () => {
    const login = createStore("login");
    const email = createStore("email");

    await login.increment("1.2.3.4");
    const second = await login.increment("1.2.3.4");
    assert.equal(second.totalHits, 2);
    assert.ok(second.resetTime > new Date());

    assert.equal((await login.increment("5.6.7.8")).totalHits, 1);
    assert.equal((await email.increment("1.2.3.4")).totalHits, 1);
  });

  test("simultaneous hits are all counted", async () => {
    const store = createStore("burst");
    await Promise.all(Array.from({ length: 20 }, () => store.increment("9.9.9.9")));
    assert.equal((await store.increment("9.9.9.9")).totalHits, 21);
  });

  test("a new window starts once the previous one has ended", async () => {
    const store = createStore("window");
    await store.increment("client");
    await store.increment("client");
    await RateLimit.updateOne({ _id: "window:client" }, { resetAt: new Date(Date.now() - 1000) });

    const fresh = await store.increment("client");
    assert.equal(fresh.totalHits, 1);
    assert.ok(fresh.resetTime > new Date());
  });

  test("decrement and reset", async () => {
    const store = createStore("undo");
    await store.increment("client");
    await store.increment("client");
    await store.decrement("client");
    assert.equal((await store.increment("client")).totalHits, 2);

    await store.resetKey("client");
    assert.equal((await store.increment("client")).totalHits, 1);
  });
});
