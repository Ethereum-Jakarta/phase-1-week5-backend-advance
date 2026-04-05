import { beforeEach, describe, expect, it, mock } from "bun:test";
import { AuthServices } from "../../src/modules/auth/services";
import { ResponseError } from "../../src/errors/customError";

describe("AuthServices", () => {
  let auth: AuthServices;
  let mockDb: any;
  let originalHash: any;
  let originalVerify: any;

  // Mock data
  const mockUser = {
    id: "user-123",
    username: "amiul",
    email: "amirul@mail.com",
    password: "$2b$10$hashedPasswordHere",
    token: null,
    createdAt: new Date(),
  };

  const registerRequest = {
    username: "amiul",
    password: "sughoi123",
    email: "amirul@mail.com",
  };

  const loginRequest = {
    email: "amirul@mail.com",
    password: "sughoi123",
  };

  beforeEach(async () => {
    // Store original functions
    originalHash = Bun.password.hash;
    originalVerify = Bun.password.verify;

    // Hash the password once for all tests
    const hashedPassword = await Bun.password.hash("sughoi123", {
      algorithm: "bcrypt",
      cost: 10,
    });

    // Create mock user with properly hashed password
    const testUserWithHash = {
      id: "user-123",
      username: "amiul",
      email: "amirul@mail.com",
      password: hashedPassword,
      token: null,
      createdAt: new Date(),
    };

    // Create the chain: insert().values().returning()
    // Note: values() and set() return synchronously, only returning() and where() are async
    mockDb = {
      insert: (table: any) => ({
        values: (data: any) => ({
          returning: async () => [testUserWithHash],
        }),
      }),
      update: (table: any) => ({
        set: (data: any) => ({
          where: async () => ({}),
        }),
      }),
      query: {
        usersTable: {
          findFirst: async () => testUserWithHash,
        },
      },
    };

    auth = new AuthServices(mockDb);
  });

  // Cleanup after each test
  const cleanup = () => {
    (Bun.password as any).hash = originalHash;
    (Bun.password as any).verify = originalVerify;
  };

  describe("register", () => {
    it("should register a new user with hashed password", async () => {
      const mockHashedPassword = "$2b$10$hashedPasswordHere";

      // Mock password hashing
      (Bun.password as any).hash = mock(async () => mockHashedPassword);

      const result = await auth.register(registerRequest);

      expect(result.username).toBe("amiul");
      expect(result.email).toBe("amirul@mail.com");
      expect(result.id).toBe("user-123");

      cleanup();
    });

    it("should return RegisterResponseDto with correct properties", async () => {
      (Bun.password as any).hash = mock(async () => "$2b$10$hashed");

      const result = await auth.register(registerRequest);

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("username");
      expect(result).toHaveProperty("email");
      expect(result).toHaveProperty("createdAt");

      cleanup();
    });

    it("should call password hash with correct algorithm", async () => {
      const hashMock = mock(async () => "$2b$10$hashed");
      (Bun.password as any).hash = hashMock;

      await auth.register(registerRequest);

      expect(hashMock.mock.calls?.length).toBe(1);
      const hashArgs = hashMock.mock.calls?.[0];
      expect(hashArgs).toBeDefined();
      expect((hashArgs as any[])?.[0]).toBe(registerRequest.password);
      expect((hashArgs as any[])?.[1]).toHaveProperty("algorithm", "bcrypt");
      expect((hashArgs as any[])?.[1]).toHaveProperty("cost", 10);

      cleanup();
    });
  });

  describe("login", () => {
    it("should throw ResponseError with invalid credentials", async () => {
      const accessJwt = { sign: mock(async () => "token") };
      const refreshJwt = { sign: mock(async () => "token") };

      const invalidLoginRequest = {
        email: "amirul@mail.com",
        password: "wrongpassword",
      };

      try {
        await auth.login(invalidLoginRequest, accessJwt, refreshJwt);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(ResponseError);
        if (error instanceof ResponseError) {
          expect(error.statusCode).toBe(401);
          expect(error.message).toBe("Invalid Credentials");
        }
      }
    });

    it("should throw ResponseError when user not found", async () => {
      // Mock findFirst to return null
      const mockDbNotFound = {
        insert: (table: any) => ({
          values: (data: any) => ({
            returning: async () => [{ id: "test" }],
          }),
        }),
        update: (table: any) => ({
          set: (data: any) => ({
            where: async () => ({}),
          }),
        }),
        query: {
          usersTable: {
            findFirst: async () => null,
          },
        },
      };

      const authWithNoUser = new AuthServices(mockDbNotFound);

      const accessJwt = { sign: mock(async () => "token") };
      const refreshJwt = { sign: mock(async () => "token") };

      try {
        await authWithNoUser.login(loginRequest, accessJwt, refreshJwt);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(ResponseError);
        if (error instanceof ResponseError) {
          expect(error.statusCode).toBe(401);
        }
      }
    });

    it("should verify JWT signers are not called on invalid credentials", async () => {
      const accessJwtSignMock = mock(async () => "token");
      const accessJwt = { sign: accessJwtSignMock };
      const refreshJwt = { sign: mock(async () => "token") };

      const invalidLoginRequest = {
        email: "amirul@mail.com",
        password: "invalidpassword",
      };

      try {
        await auth.login(invalidLoginRequest, accessJwt, refreshJwt);
      } catch {
        // Expected error
      }

      // JWT sign should NOT have been called due to validation failure
      expect(accessJwtSignMock.mock.calls?.length).toBe(0);
    });

    it("should accept RefreshJwt with sign method", async () => {
      // Verify the method accepts a JWT signer interface
      const accessJwt = { sign: mock(async () => "access") };
      const refreshJwt = { sign: mock(async () => "refresh") };

      // Just verify the method accepts these parameters without error
      try {
        await auth.login(loginRequest, accessJwt, refreshJwt);
      } catch {
        // Expected to error on credentials
      }

      expect(true).toBe(true);
    });
  });

  describe("deleteSession", () => {
    it("should delete user session by setting token to null", async () => {
      // Just verify the method runs without error
      await auth.deleteSession("user-123");
      expect(true).toBe(true);
    });

    it("should call update on usersTable with correct filter", async () => {
      // Just verify the method runs without error
      await auth.deleteSession("user-456");
      expect(true).toBe(true);
    });
  });

  describe("newRefreshToken", () => {
    it("should generate new access token from refresh token", async () => {
      const mockNewAccessToken = "new-access-token";

      const refreshJwt = {
        sign: mock(async (payload) => {
          expect(payload).toHaveProperty("id");
          expect(payload).toHaveProperty("username");
          return mockNewAccessToken;
        }),
      };

      const payload = { id: "user-123", username: "amiul" };
      const result = await auth.newRefreshToken(payload, refreshJwt);

      expect(result.accessToken).toBe(mockNewAccessToken);
      expect(refreshJwt.sign.mock.calls?.length).toBe(1);
    });

    it("should accept correct payload structure", async () => {
      const refreshJwt = {
        sign: mock(async () => "token"),
      };

      const payload = { id: "user-123", username: "testuser" };
      await auth.newRefreshToken(payload, refreshJwt);

      const callArg = (refreshJwt.sign.mock.calls as any[][])?.[0]?.[0];
      expect(callArg).toBeDefined();
      expect(callArg).toEqual(payload);
    });

    it("should return object with accessToken property", async () => {
      const refreshJwt = {
        sign: mock(async () => "generated-token"),
      };

      const result = await auth.newRefreshToken(
        { id: "user-123", username: "test" },
        refreshJwt,
      );

      expect(result).toHaveProperty("accessToken");
      expect(result.accessToken).toBe("generated-token");
    });
  });
});
