import { Elysia } from 'elysia'
import dotenv from 'dotenv'
import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

dotenv.config()


const db = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
})


async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash(password, salt)
}

async function comparePassword(password: string, hash: string) {
  return await bcrypt.compare(password, hash)
}


async function authMiddleware(ctx: any, next: any) {
  const authHeader = ctx.req.headers.get('authorization')
  if (!authHeader) return ctx.response.status(401).send({ error: 'Authorization header missing' })

  const token = authHeader.split(' ')[1]
  if (!token) return ctx.response.status(401).send({ error: 'Token missing' })

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!)
    ctx.set('user', payload)
    await next()
  } catch {
    return ctx.response.status(401).send({ error: 'Invalid or expired token' })
  }
}

const app = new Elysia()


app.post('/register', async (ctx) => {
  const { name, email, password } = await ctx.body
  
  const [rows]: any = await db.execute('SELECT * FROM users WHERE email = ?', [email])
  if (rows.length > 0) return { error: 'User already exists' }

  
  const hashedPassword = await hashPassword(password)

  
  await db.execute('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [
    name,
    email,
    hashedPassword
  ])

  return { message: 'User registered successfully' }
})


app.post('/login', async (ctx) => {
  const { email, password } = await ctx.body
  const [rows]: any = await db.execute('SELECT * FROM users WHERE email = ?', [email])

  if (rows.length === 0) return { error: 'Invalid email or password' }

  const user = rows[0]
  const isMatch = await comparePassword(password, user.password)
  if (!isMatch) return { error: 'Invalid email or password' }

  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET!, {
    expiresIn: '1d'
  })

  return { token }
})

app.listen({
  port: Number(process.env.PORT) || 3000,
})

console.log(`Auth service running on port ${process.env.PORT}`)
