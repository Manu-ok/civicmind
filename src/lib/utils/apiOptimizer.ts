import { NextRequest, NextResponse } from "next/server";

// Simple in-memory cache for API Routes
const cache = new Map<string, { data: any; expiry: number }>();

export function getCachedResponse(key: string) {
  const cached = cache.get(key);
  if (cached && cached.expiry > Date.now()) {
    return cached.data;
  }
  return null;
}

export function setCachedResponse(key: string, data: any, ttlSeconds: number = 3600) {
  cache.set(key, { data, expiry: Date.now() + ttlSeconds * 1000 });
}

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function isRateLimited(req: NextRequest, maxRequests: number = 10, windowMs: number = 60000): boolean {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "anonymous";
  const now = Date.now();
  
  let record = rateLimitMap.get(ip);
  if (!record || record.resetAt < now) {
    record = { count: 1, resetAt: now + windowMs };
    rateLimitMap.set(ip, record);
    return false;
  }
  
  if (record.count >= maxRequests) {
    return true; // Rate limited
  }
  
  record.count += 1;
  return false;
}

export async function withRetry<T>(fn: () => Promise<T>, maxRetries = 1): Promise<T> {
  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      attempt++;
      console.warn(`Retry attempt ${attempt} failed, retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  throw new Error("Retry failed");
}
