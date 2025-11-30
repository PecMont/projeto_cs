import Stripe from 'stripe'
import Env from '#start/env'

const stripeSecret = Env.get('STRIPE_SECRET_KEY')
if (!stripeSecret) {
  throw new Error('Environment variable STRIPE_SECRET_KEY is required')
}

export const stripe = new Stripe(stripeSecret)
