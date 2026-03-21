import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Upstash Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Rate limit configurations
export const RATE_LIMITS = {
  login: {
    maxAttempts: 5,
    windowMs: "15 m", // 15 minutes
  },
  register: {
    maxAttempts: 3,
    windowMs: "1 h", // 1 hour
  },
  forgotPassword: {
    maxAttempts: 3,
    windowMs: "1 h", // 1 hour
  },
  resetPassword: {
    maxAttempts: 5,
    windowMs: "15 m", // 15 minutes
  },
  resendVerification: {
    maxAttempts: 3,
    windowMs: "15 m", // 15 minutes
  },
} as const;

// Helper to extract IP address from request
export function getClientIP(request: Request): string {
  const headers = request.headers;

  // Check for x-forwarded-for (Vercel, proxies)
  const xForwardedFor = headers.get("x-forwarded-for");
  if (xForwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return xForwardedFor.split(",")[0].trim();
  }

  // Check for x-real-ip
  const xRealIp = headers.get("x-real-ip");
  if (xRealIp) {
    return xRealIp;
  }

  // Fallback: this won't work in serverless but we'll handle it
  return "unknown";
}

// Create a rate limiter instance for a specific endpoint type
export function createRateLimiter(
  type: keyof typeof RATE_LIMITS,
  options?: {
    identifier?: string; // Additional identifier like email to combine with IP
  },
) {
  const config = RATE_LIMITS[type];

  const ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(config.maxAttempts, config.windowMs),
    analytics: false, // Disable analytics for cost savings
    prefix: "@devstash/ratelimit",
  });

  return {
    check: async (
      request: Request,
    ): Promise<{
      success: boolean;
      remaining: number;
      reset: number;
      limit: number;
    }> => {
      try {
        const ip = getClientIP(request);
        const key = options?.identifier
          ? `${ip}:${options.identifier}:${type}`
          : `${ip}:${type}`;

        const { success, limit, remaining, reset } = await ratelimit.limit(key);

        return {
          success,
          limit,
          remaining,
          reset: Math.floor(reset / 1000), // Convert to seconds
        };
      } catch (error) {
        console.error("Rate limit check failed:", error);
        // Fail open: allow the request if rate limit service is unavailable
        return {
          success: true,
          limit: config.maxAttempts,
          remaining: config.maxAttempts,
          reset: 0,
        };
      }
    },
  };
}

// Middleware helper for API routes
export async function withRateLimit(
  request: Request,
  type: keyof typeof RATE_LIMITS,
  identifier?: string,
): Promise<Response | null> {
  const ratelimit = createRateLimiter(
    type,
    identifier ? { identifier } : undefined,
  );
  const { success, remaining, reset } = await ratelimit.check(request);

  if (!success) {
    return new Response(
      JSON.stringify({
        error: `Too many attempts. Please try again in ${Math.ceil(reset / 60)} minutes.`,
        remaining,
        reset,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": reset.toString(),
        },
      },
    );
  }

  return null; // No rate limit violation
}
