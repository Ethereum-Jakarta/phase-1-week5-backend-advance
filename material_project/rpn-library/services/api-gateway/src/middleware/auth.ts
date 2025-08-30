import { verify } from "./jwt"
// src/middleware/auth.ts

export const authMiddleware = async ({ request, set }: any) => {
  const authHeader = request.headers.get('authorization')
  console.log('Auth header:', authHeader) // Debug log

  if (!authHeader?.startsWith('Bearer ')) {
    set.status = 401
    return { error: 'Unauthorized - No token provided' }
  }

  try {
    const token = authHeader.split(' ')[1]
    console.log('Token to verify:', token) // Debug log

    const payload = await verify(token)
    console.log('Token payload:', payload) // Debug log

    // Ensure token is properly set for downstream requests
    if (!request.headers.has('authorization')) {
      request.headers.set('authorization', authHeader)
    }

    return
  } catch (error) {
    console.error('Auth error:', error)
    set.status = 401
    return { error: 'Invalid token' }
  }
}