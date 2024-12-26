import { createAccessToken } from "actor-kit/server";
import { describe, expect, it, vi } from "vitest";
import {
  handleActorToken,
  handleEmailCode,
  handleEmailVerify,
  handleNewUser,
  handleRefreshToken,
} from "../app/auth";
import type { Env } from "../app/env";

// Mock dependencies
vi.mock("actor-kit/server", () => ({
  createAccessToken: vi.fn().mockResolvedValue("mock-access-token"),
}));

vi.mock("../app/utils", () => ({
  createNewUserSession: vi
    .fn()
    .mockResolvedValue({
      userId: "mock-user-id",
      sessionId: "mock-session-id",
      sessionToken: "mock-session-token",
      refreshToken: "mock-refresh-token",
    }),
  createRefreshToken: vi.fn().mockResolvedValue("mock-refresh-token"),
  createSessionToken: vi.fn().mockResolvedValue("mock-session-token"),
  verifyRefreshToken: vi.fn().mockImplementation(async ({ token }) => {
    if (token === "valid-refresh-token") {
      return { userId: "mock-user-id" };
    }
    return null;
  }),
  verifySessionToken: vi.fn().mockImplementation(async ({ token }) => {
    if (token === "valid-session-token") {
      return { userId: "mock-user-id", sessionId: "mock-session-id" };
    }
    return null;
  }),
}));

// Mock Env
const mockEnv = {
  SESSION_JWT_SECRET: "mock-session-secret",
  ACTOR_KIT_SECRET: "mock-actor-kit-secret",
} as Env;

describe("Auth Handlers", () => {
  describe("handleNewUser", () => {
    it("should create a new user session and return tokens", async () => {
      const request = new Request("https://example.com/auth/user", {
        method: "POST",
      });

      const response = await handleNewUser(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        userId: "mock-user-id",
        sessionId: "mock-session-id",
        sessionToken: "mock-session-token",
        refreshToken: "mock-refresh-token",
      });
    });
  });

  describe("handleEmailCode", () => {
    it("should validate email and return success response", async () => {
      const request = new Request("https://example.com/auth/email/code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@example.com" }),
      });

      const response = await handleEmailCode(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        message: "Code sent to email",
        expiresIn: 600,
      });
    });

    it("should return 400 for invalid email", async () => {
      const request = new Request("https://example.com/auth/email/code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "invalid-email" }),
      });

      const response = await handleEmailCode(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid request format");
    });
  });

  describe("handleEmailVerify", () => {
    it("should verify code and return new session", async () => {
      const request = new Request("https://example.com/auth/email/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          code: "123456",
        }),
      });

      const response = await handleEmailVerify(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        userId: "mock-user-id",
        accessToken: "mock-session-token",
        refreshToken: "mock-refresh-token",
      });
    });

    it("should return 400 for invalid code format", async () => {
      const request = new Request("https://example.com/auth/email/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          code: "12345", // Too short
        }),
      });

      const response = await handleEmailVerify(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid request format");
    });
  });

  describe("handleRefreshToken", () => {
    it("should refresh tokens with valid refresh token", async () => {
      const request = new Request("https://example.com/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          refreshToken: "valid-refresh-token",
        }),
      });

      const response = await handleRefreshToken(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        userId: "mock-user-id",
        sessionToken: "mock-session-token",
        refreshToken: "mock-refresh-token",
      });
    });

    it("should return 401 for invalid refresh token", async () => {
      const request = new Request("https://example.com/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          refreshToken: "invalid-refresh-token",
        }),
      });

      const response = await handleRefreshToken(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Invalid refresh token");
    });
  });

  describe("handleActorToken", () => {
    it("should generate actor-specific token", async () => {
      const request = new Request("https://example.com/auth/access-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer valid-session-token",
        },
        body: JSON.stringify({
          actorType: "user",
          actorId: "mock-user-id",
        }),
      });

      const response = await handleActorToken(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        accessToken: "mock-access-token",
      });
      expect(createAccessToken).toHaveBeenCalledWith({
        signingKey: mockEnv.ACTOR_KIT_SECRET,
        actorId: "mock-user-id",
        actorType: "user",
        callerId: "mock-user-id",
        callerType: "client",
      });
    });

    it("should return 400 for invalid request format", async () => {
      const request = new Request("https://example.com/auth/access-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Missing required fields
        }),
      });

      const response = await handleActorToken(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid request format");
    });

    it("should return 401 when no authorization header is present", async () => {
      const request = new Request("https://example.com/auth/access-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actorType: "user",
          actorId: "mock-actor-id",
        }),
      });

      const response = await handleActorToken(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Missing authorization header");
    });

    it("should return 401 when authorization token is invalid", async () => {
      const request = new Request("https://example.com/auth/access-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer invalid-token",
        },
        body: JSON.stringify({
          actorType: "user",
          actorId: "mock-actor-id",
        }),
      });

      const response = await handleActorToken(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Invalid session token");
    });

    it("should return 403 when user doesn't have permission for actor", async () => {
      const request = new Request("https://example.com/auth/access-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer valid-session-token",
        },
        body: JSON.stringify({
          actorType: "user",
          actorId: "different-user-id",
        }),
      });

      const response = await handleActorToken(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe("Not authorized for this actor");
    });

    it("should succeed when user requests token for themselves", async () => {
      const request = new Request("https://example.com/auth/access-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer valid-session-token",
        },
        body: JSON.stringify({
          actorType: "user",
          actorId: "mock-user-id", // Same as the user's ID
        }),
      });

      const response = await handleActorToken(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        accessToken: "mock-access-token",
      });
    });
  });
});
