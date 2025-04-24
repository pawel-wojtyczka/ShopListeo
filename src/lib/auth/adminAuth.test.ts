import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { isUserAdmin } from "./adminAuth.ts";

// Mock the Supabase client module
vi.mock("@supabase/supabase-js", () => {
  const mockSupabaseClient = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
  };
  return {
    createClient: vi.fn(() => mockSupabaseClient),
  };
});

// Import createClient after mocking
import { createClient } from "@supabase/supabase-js";

describe("isUserAdmin", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSupabase: any;
  const testUserId = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
  const adminUserId = "4e0a9b6a-b416-48e6-8d35-5700bd1d674a"; // Example admin ID from the function

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    // Get the mocked client instance
    mockSupabase = createClient("url", "key");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return true in development mode regardless of user ID", async () => {
    const result = await isUserAdmin(mockSupabase, testUserId, true);
    expect(result).toBe(true);
    // Verify Supabase was not called
    expect(mockSupabase.from).not.toHaveBeenCalled();
  });

  it("should return true for a listed admin user ID in production mode", async () => {
    // Configure the mock response for the admin user
    mockSupabase
      .from("users")
      .select("id")
      .eq("id", adminUserId)
      .single.mockResolvedValueOnce({ data: { id: adminUserId }, error: null });

    const result = await isUserAdmin(mockSupabase, adminUserId, false);
    expect(result).toBe(true);
    // Verify Supabase was called correctly
    expect(mockSupabase.from).toHaveBeenCalledWith("users");
    expect(mockSupabase.select).toHaveBeenCalledWith("id");
    expect(mockSupabase.eq).toHaveBeenCalledWith("id", adminUserId);
    expect(mockSupabase.single).toHaveBeenCalledTimes(1);
  });

  it("should return false for a non-admin user ID in production mode", async () => {
    // Configure the mock response for a non-admin user
    mockSupabase
      .from("users")
      .select("id")
      .eq("id", testUserId)
      .single.mockResolvedValueOnce({ data: { id: testUserId }, error: null });

    const result = await isUserAdmin(mockSupabase, testUserId, false);
    expect(result).toBe(false);
    // Verify Supabase was called correctly
    expect(mockSupabase.from).toHaveBeenCalledWith("users");
    expect(mockSupabase.select).toHaveBeenCalledWith("id");
    expect(mockSupabase.eq).toHaveBeenCalledWith("id", testUserId);
    expect(mockSupabase.single).toHaveBeenCalledTimes(1);
  });

  it("should return false if Supabase query returns an error", async () => {
    const testError = new Error("Supabase query failed");
    // Configure the mock response for an error
    mockSupabase
      .from("users")
      .select("id")
      .eq("id", testUserId)
      .single.mockResolvedValueOnce({ data: null, error: testError });

    const result = await isUserAdmin(mockSupabase, testUserId, false);
    expect(result).toBe(false);
  });

  it("should return false if Supabase query returns no data", async () => {
    // Configure the mock response for no data (user not found)
    mockSupabase
      .from("users")
      .select("id")
      .eq("id", testUserId)
      .single.mockResolvedValueOnce({ data: null, error: null });

    const result = await isUserAdmin(mockSupabase, testUserId, false);
    expect(result).toBe(false);
  });

  it("should return false if Supabase client throws an exception", async () => {
    const testException = new Error("Supabase client error");
    // Configure the mock to throw an exception
    mockSupabase.from.mockImplementation(() => {
      throw testException;
    });

    const result = await isUserAdmin(mockSupabase, testUserId, false);
    expect(result).toBe(false);
  });
});
