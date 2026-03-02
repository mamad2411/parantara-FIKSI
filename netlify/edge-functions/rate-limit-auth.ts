// Rate limiting for authentication endpoints
// Prevents brute force attacks

import type { Context } from "https://edge.netlify.com";

const RATE_LIMIT = 10; // requests
const WINDOW = 60 * 1000; // 1 minute

const requestCounts = new Map<string, { count: number; resetTime: number }>();

export default async (request: Request, context: Context) => {
  const ip = context.ip;
  const now = Date.now();
  
  // Clean up old entries
  for (const [key, value] of requestCounts.entries()) {
    if (now > value.resetTime) {
      requestCounts.delete(key);
    }
  }
  
  // Get or create rate limit entry
  let entry = requestCounts.get(ip);
  
  if (!entry || now > entry.resetTime) {
    entry = { count: 0, resetTime: now + WINDOW };
    requestCounts.set(ip, entry);
  }
  
  entry.count++;
  
  // Check if rate limit exceeded
  if (entry.count > RATE_LIMIT) {
    return new Response(
      JSON.stringify({
        error: "Too many requests. Please try again later.",
        retryAfter: Math.ceil((entry.resetTime - now) / 1000)
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(Math.ceil((entry.resetTime - now) / 1000)),
          "X-RateLimit-Limit": String(RATE_LIMIT),
          "X-RateLimit-Remaining": String(Math.max(0, RATE_LIMIT - entry.count)),
          "X-RateLimit-Reset": String(entry.resetTime)
        }
      }
    );
  }
  
  // Add rate limit headers to response
  const response = await context.next();
  response.headers.set("X-RateLimit-Limit", String(RATE_LIMIT));
  response.headers.set("X-RateLimit-Remaining", String(Math.max(0, RATE_LIMIT - entry.count)));
  response.headers.set("X-RateLimit-Reset", String(entry.resetTime));
  
  return response;
};

export const config = { path: "/api/auth/*" };
