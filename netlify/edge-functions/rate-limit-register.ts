// Rate limiting for registration page
// Prevents automated registration attacks

import type { Context } from "https://edge.netlify.com";

const RATE_LIMIT = 5; // requests
const WINDOW = 5 * 60 * 1000; // 5 minutes

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
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Too Many Requests</title>
          <style>
            body { font-family: system-ui; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f3f4f6; }
            .container { text-align: center; padding: 2rem; background: white; border-radius: 1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            h1 { color: #ef4444; margin: 0 0 1rem; }
            p { color: #6b7280; margin: 0.5rem 0; }
            .retry { color: #3b82f6; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>⚠️ Terlalu Banyak Permintaan</h1>
            <p>Anda telah mencoba terlalu banyak kali.</p>
            <p class="retry">Silakan coba lagi dalam ${Math.ceil((entry.resetTime - now) / 1000)} detik</p>
          </div>
        </body>
      </html>
      `,
      {
        status: 429,
        headers: {
          "Content-Type": "text/html",
          "Retry-After": String(Math.ceil((entry.resetTime - now) / 1000))
        }
      }
    );
  }
  
  return context.next();
};

export const config = { path: "/register" };
