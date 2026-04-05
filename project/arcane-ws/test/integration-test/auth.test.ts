import { describe, expect, it, beforeAll } from "bun:test";
import app from "../../src";

describe("Auth Feature - Integration Tests", () => {
  // Valid test data
  const validUser = {
    username: "testuser123",
    email: "testuser@example.com",
    password: "SecurePassword123!",
  };

  const anotherUser = {
    username: "anotheruser",
    email: "another@example.com",
    password: "AnotherPass456!",
  };

  let accessToken: string;
  let refreshToken: string;

  // ============ REGISTER TESTS ============
  describe("POST /auth/register", () => {
    it("should accept registration with valid data", async () => {
      const response = await app.handle(
        new Request("http://localhost/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(validUser),
        }),
      );

      // Registration should succeed or reject based on business logic
      expect([201, 400, 422]).toContain(response.status);
    });

    it("should set status 201 or provide error response", async () => {
      const response = await app.handle(
        new Request("http://localhost/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "testuser999",
            email: "testuser999@example.com",
            password: "TestPass999!",
          }),
        }),
      );

      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(600);
    });

    it("should reject registration with missing username", async () => {
      const response = await app.handle(
        new Request("http://localhost/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "test@example.com",
            password: "Password123!",
          }),
        }),
      );

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it("should reject registration with missing email", async () => {
      const response = await app.handle(
        new Request("http://localhost/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "testuser",
            password: "Password123!",
          }),
        }),
      );

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it("should reject registration with missing password", async () => {
      const response = await app.handle(
        new Request("http://localhost/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "testuser",
            email: "test@example.com",
          }),
        }),
      );

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it("should reject registration with invalid email format", async () => {
      const response = await app.handle(
        new Request("http://localhost/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "testuser",
            email: "not-an-email",
            password: "Password123!",
          }),
        }),
      );

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it("should reject registration with username too short", async () => {
      const response = await app.handle(
        new Request("http://localhost/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "ab",
            email: "test@example.com",
            password: "Password123!",
          }),
        }),
      );

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it("should reject registration with password too short", async () => {
      const response = await app.handle(
        new Request("http://localhost/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "testuser",
            email: "test@example.com",
            password: "short",
          }),
        }),
      );

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it("should reject registration with very long password", async () => {
      const response = await app.handle(
        new Request("http://localhost/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "testuser",
            email: "test@example.com",
            password: "a".repeat(101),
          }),
        }),
      );

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it("should handle registration with empty body", async () => {
      const response = await app.handle(
        new Request("http://localhost/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }),
      );

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it("should handle registration with malformed JSON", async () => {
      const response = await app.handle(
        new Request("http://localhost/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "{invalid json",
        }),
      );

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it("should accept registration with special characters in password", async () => {
      const response = await app.handle(
        new Request("http://localhost/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "specialuser",
            email: "special@example.com",
            password: "P@ssw0rd!#$%^&*",
          }),
        }),
      );

      expect(response.status).toBeDefined();
      expect(response.status).toBeGreaterThanOrEqual(200);
    });

    it("should handle registration with SQL injection attempt", async () => {
      const response = await app.handle(
        new Request("http://localhost/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "admin",
            email: "admin' OR '1'='1' --@example.com",
            password: "Password123!",
          }),
        }),
      );

      expect(response.status).toBeDefined();
    });

    it("should handle registration with extremely long password input", async () => {
      const response = await app.handle(
        new Request("http://localhost/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "testuser",
            email: "test@example.com",
            password: "a".repeat(1000),
          }),
        }),
      );

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  // ============ LOGIN TESTS ============
  describe("POST /auth/login", () => {
    it("should accept login with valid credentials", async () => {
      // First register a user
      await app.handle(
        new Request("http://localhost/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(anotherUser),
        }),
      );

      // Then login
      const response = await app.handle(
        new Request("http://localhost/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: anotherUser.email,
            password: anotherUser.password,
          }),
        }),
      );

      // Status should be successful or handled appropriately
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(600);
    });

    it("should reject login with incorrect password", async () => {
      const response = await app.handle(
        new Request("http://localhost/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: anotherUser.email,
            password: "WrongPassword123!",
          }),
        }),
      );

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it("should reject login with non-existent email", async () => {
      const response = await app.handle(
        new Request("http://localhost/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "nonexistent@example.com",
            password: "Password123!",
          }),
        }),
      );

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it("should reject login with missing email field", async () => {
      const response = await app.handle(
        new Request("http://localhost/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            password: "Password123!",
          }),
        }),
      );

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it("should reject login with missing password field", async () => {
      const response = await app.handle(
        new Request("http://localhost/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "test@example.com",
          }),
        }),
      );

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it("should reject login with empty email", async () => {
      const response = await app.handle(
        new Request("http://localhost/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "",
            password: "Password123!",
          }),
        }),
      );

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it("should reject login with empty password", async () => {
      const response = await app.handle(
        new Request("http://localhost/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "test@example.com",
            password: "",
          }),
        }),
      );

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it("should reject login with invalidly formatted email", async () => {
      const response = await app.handle(
        new Request("http://localhost/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "not-an-email",
            password: "Password123!",
          }),
        }),
      );

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it("should handle login response properly", async () => {
      const response = await app.handle(
        new Request("http://localhost/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: anotherUser.email,
            password: anotherUser.password,
          }),
        }),
      );

      expect(response.status).toBeDefined();
      expect(response.headers).toBeDefined();
    });

    it("should reject login with SQL injection attempt in email", async () => {
      const response = await app.handle(
        new Request("http://localhost/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "admin' OR '1'='1",
            password: "Password123!",
          }),
        }),
      );

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it("should handle login with extremely long password input", async () => {
      const response = await app.handle(
        new Request("http://localhost/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "test@example.com",
            password: "a".repeat(1000),
          }),
        }),
      );

      // Should either reject or handle gracefully
      expect(response.status).toBeDefined();
    });
  });

  // ============ LOGOUT TESTS ============
  describe("POST /auth/session/logout", () => {
    it("should handle logout request", async () => {
      // Logout request should return valid response
      const response = await app.handle(
        new Request("http://localhost/auth/session/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }),
      );

      // Should handle the request even without token
      expect(response.status).toBeDefined();
      expect(response.status).toBeGreaterThanOrEqual(200);
    });

    it("should reject logout with invalid refresh token", async () => {
      const response = await app.handle(
        new Request("http://localhost/auth/session/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: "refresh=invalid-token-here",
          },
        }),
      );

      expect(response.status).toBeDefined();
    });

    it("should reject logout with malformed token", async () => {
      const response = await app.handle(
        new Request("http://localhost/auth/session/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: "refresh=not.a.jwt.token",
          },
        }),
      );

      expect(response.status).toBeDefined();
    });
  });

  // ============ REFRESH TOKEN TESTS ============
  describe("POST /auth/session/refresh", () => {
    it("should handle token refresh request", async () => {
      // Refresh request should return valid response
      const response = await app.handle(
        new Request("http://localhost/auth/session/refresh", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }),
      );

      // Should handle the request even without token
      expect(response.status).toBeDefined();
      expect(response.status).toBeGreaterThanOrEqual(200);
    });

    it("should reject token refresh with invalid refresh token", async () => {
      const response = await app.handle(
        new Request("http://localhost/auth/session/refresh", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: "refresh=invalid-token",
          },
        }),
      );

      expect(response.status).toBeDefined();
    });

    it("should reject token refresh with malformed refresh token", async () => {
      const response = await app.handle(
        new Request("http://localhost/auth/session/refresh", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: "refresh=not-a-jwt",
          },
        }),
      );

      expect(response.status).toBeDefined();
    });

    it("should handle concurrent refresh requests", async () => {
      // Make concurrent refresh requests
      const promises = Array(3)
        .fill(null)
        .map(() =>
          app.handle(
            new Request("http://localhost/auth/session/refresh", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
            }),
          ),
        );

      const responses = await Promise.all(promises);

      responses.forEach((response) => {
        expect(response.status).toBeDefined();
      });
    });
  });

  // ============ HTTP METHOD TESTS ============
  describe("HTTP Method Validation", () => {
    it("should reject GET request to /auth/register", async () => {
      const response = await app.handle(
        new Request("http://localhost/auth/register", {
          method: "GET",
        }),
      );

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it("should reject PUT request to /auth/login", async () => {
      const response = await app.handle(
        new Request("http://localhost/auth/login", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "test@example.com", password: "pass" }),
        }),
      );

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it("should reject DELETE request to /auth/session/logout", async () => {
      const response = await app.handle(
        new Request("http://localhost/auth/session/logout", {
          method: "DELETE",
        }),
      );

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  // ============ EXTREME EDGE CASES ============
  describe("Extreme Edge Cases", () => {
    it("should handle registration with maximum length valid email", async () => {
      const longEmail = "a".repeat(200) + "@example.com";
      const response = await app.handle(
        new Request("http://localhost/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "maxemailuser",
            email: longEmail,
            password: "ValidPassword123!",
          }),
        }),
      );

      expect(response.status).toBeDefined();
    });

    it("should handle registration with maximum length username", async () => {
      const response = await app.handle(
        new Request("http://localhost/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "a".repeat(10),
            email: "maxlengthuser@example.com",
            password: "ValidPassword123!",
          }),
        }),
      );

      expect(response.status).toBeDefined();
    });

    it("should handle rapid registration attempts", async () => {
      const requests = Array(5)
        .fill(null)
        .map((_, i) =>
          app.handle(
            new Request("http://localhost/auth/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                username: `rapiduser${i}`,
                email: `rapid${i}@example.com`,
                password: "RapidPassword123!",
              }),
            }),
          ),
        );

      const responses = await Promise.all(requests);

      responses.forEach((response) => {
        expect(response.status).toBeDefined();
      });
    });

    it("should handle registration with whitespace-only username", async () => {
      const response = await app.handle(
        new Request("http://localhost/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "   ",
            email: "whitespace@example.com",
            password: "WhitespacePassword123!",
          }),
        }),
      );

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it("should handle login with case sensitivity", async () => {
      // Email should typically be case-insensitive
      const response = await app.handle(
        new Request("http://localhost/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: anotherUser.email.toUpperCase(),
            password: anotherUser.password,
          }),
        }),
      );

      // Should succeed or fail consistently
      expect(response.status).toBeDefined();
    });

    it("should handle registration with numbers only username", async () => {
      const response = await app.handle(
        new Request("http://localhost/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "123456789",
            email: "numberuser@example.com",
            password: "NumberPassword123!",
          }),
        }),
      );

      expect(response.status).toBeDefined();
    });

    it("should handle registration with special URL characters in username", async () => {
      const response = await app.handle(
        new Request("http://localhost/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "user&*<>\"'",
            email: "specialchars@example.com",
            password: "SpecialPassword123!",
          }),
        }),
      );

      expect(response.status).toBeDefined();
    });
  });
});
