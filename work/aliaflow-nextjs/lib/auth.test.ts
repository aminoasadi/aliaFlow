import { beforeAll, describe, expect, it } from "vitest";

beforeAll(() => {
  process.env.SESSION_SECRET = "test-secret-at-least-32-bytes-long";
});

describe("auth", () => {
  it("hashes and verifies a password", async () => {
    const { hashPassword, verifyPassword } = await import("./auth");
    const hash = await hashPassword("correct-horse");
    expect(hash).not.toEqual("correct-horse");
    expect(await verifyPassword("correct-horse", hash)).toBe(true);
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });

  it("creates a session token that verifies back to the same user id", async () => {
    const { createSessionToken, verifySessionToken } = await import("./auth");
    const token = await createSessionToken("user-123");
    const session = await verifySessionToken(token);
    expect(session).toEqual({ sub: "user-123" });
  });

  it("rejects a garbage token", async () => {
    const { verifySessionToken } = await import("./auth");
    expect(await verifySessionToken("not-a-real-token")).toBeNull();
  });
});
