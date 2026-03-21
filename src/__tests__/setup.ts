import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Mock environment variables if needed
vi.stubEnv("DATABASE_URL", "postgresql://test:test@localhost:5432/test");
vi.stubEnv("NEXTAUTH_SECRET", "test-secret");
vi.stubEnv("NEXTAUTH_URL", "http://localhost:3000");
vi.stubEnv("UPSTASH_REDIS_REST_URL", "http://localhost:3000");
vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "test-token");
vi.stubEnv("RESEND_API_KEY", "test-api-key");
