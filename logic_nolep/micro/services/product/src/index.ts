import { Elysia } from 'elysia'
import Stripe from 'stripe'
import dotenv from 'dotenv'

dotenv.config()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15',
})

const app = new Elysia()


app.get('/products', async () => {
  const products = await stripe.products.list()
  return {
    products: products.data.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      active: p.active,
      prices: [] 
    }))
  }
})


app.get('/products/:id/prices', async ({ params }) => {
  const prices = await stripe.prices.list({
    product: params.id,
  })

  return {
    prices: prices.data.map(price => ({
      id: price.id,
      unit_amount: price.unit_amount,
      currency: price.currency,
      recurring: price.recurring
    }))
  }
})

app.listen({
  port: Number(process.env.PORT) || 3001
})

console.log(`Product service running on port ${process.env.PORT}`)
