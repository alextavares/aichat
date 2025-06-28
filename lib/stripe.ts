import Stripe from 'stripe'

let stripe: Stripe | null = null

function getStripe(): Stripe {
  if (!stripe && process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-05-28.basil',
      typescript: true,
    })
  }
  if (!stripe) {
    throw new Error('Stripe not initialized. Missing STRIPE_SECRET_KEY environment variable.')
  }
  return stripe
}

export { getStripe as stripe }

export const getStripeJs = async () => {
  const { loadStripe } = await import('@stripe/stripe-js')
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
}