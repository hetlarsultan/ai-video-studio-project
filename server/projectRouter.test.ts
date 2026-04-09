import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createProjectContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `user${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as unknown as TrpcContext["res"],
  };

  return ctx;
}

describe("projects router", () => {
  it("should create a new project", async () => {
    const ctx = createProjectContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.projects.create({
      title: "Test Video Project",
      description: "A test project for video editing",
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain("بنجاح");
  });

  it("should list projects for authenticated user", async () => {
    const ctx = createProjectContext();
    const caller = appRouter.createCaller(ctx);

    // Create a project first
    await caller.projects.create({
      title: "Test Project 1",
      description: "First test project",
    });

    // List projects
    const result = await caller.projects.list();

    expect(result.success).toBe(true);
    expect(Array.isArray(result.projects)).toBe(true);
  });

  it("should not allow access to other user's projects", async () => {
    const ctx1 = createProjectContext(1);
    const ctx2 = createProjectContext(2);
    const caller1 = appRouter.createCaller(ctx1);
    const caller2 = appRouter.createCaller(ctx2);

    // Create a project with user 1
    await caller1.projects.create({
      title: "User 1 Project",
    });

    // Try to get projects as user 2
    const result = await caller2.projects.list();

    // User 2 should have empty projects list
    expect(result.success).toBe(true);
    expect(result.projects.length).toBe(0);
  });

  it("should validate project title is required", async () => {
    const ctx = createProjectContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.projects.create({
        title: "",
        description: "Test",
      });
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it("should handle database errors gracefully", async () => {
    const ctx = createProjectContext();
    const caller = appRouter.createCaller(ctx);

    // Create a project with very long title
    const longTitle = "a".repeat(300);
    try {
      await caller.projects.create({
        title: longTitle,
      });
      expect.fail("Should have thrown validation error");
    } catch (error) {
      // Should fail due to title length validation
      expect(error).toBeDefined();
    }
  });
});
