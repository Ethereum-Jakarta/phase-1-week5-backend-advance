// src/middleware/rateLimit.ts
import { Elysia } from 'elysia'

const rateLimits = new Map()

export const rateLimit = new Elysia().onRequest(({ request, set }: any) => {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const now = Date.now()
  const windowMs = 60000 // 1 minute
  const limit = 100 // requests per windowMs

  const requests = rateLimits.get(ip) || []
  const windowStart = now - windowMs

  // Clean old requests
  while (requests.length && requests[0] <= windowStart) {
    requests.shift()
  }

  if (requests.length >= limit) {
    set.status = 429
    return { error: 'Too many requests' }
  }

  requests.push(now)
  rateLimits.set(ip, requests)
})