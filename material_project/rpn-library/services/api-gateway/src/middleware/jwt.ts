// src/middleware/jwt.ts
import { verify as jwtVerify } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

interface JWTPayload {
  id: string
  [key: string]: any
}

export const verify = (token: string): Promise<JWTPayload> => {
  return new Promise((resolve, reject) => {
    jwtVerify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        reject(err)
      } else {
        resolve(decoded as JWTPayload)
      }
    })
  })
}