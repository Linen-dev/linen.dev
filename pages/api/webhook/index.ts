import { NextApiRequest, NextApiResponse } from 'next/types';

const HOST = process.env.NEXTAUTH_URL || 'http://localhost:3000';

const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_API_KEY);

async function create(request: NextApiRequest, response: NextApiResponse) {
  let data;
  let eventType;
  let event;
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return response.status(400);
  }
  let signature = request.headers['stripe-signature'];

  try {
    event = stripe.webhooks.constructEvent(request.body, signature, secret);
  } catch (err) {
    return response.status(400);
  }
  // Extract the object from the event.
  data = event.data;
  eventType = event.type;

  switch (eventType) {
    case 'checkout.session.completed':
      console.log(data);
      break;
    case 'invoice.paid':
      console.log(data);
      break;
    case 'invoice.payment_failed':
      console.log(data);
      break;
    default:
    // Unhandled event type
  }

  return response.status(200);
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === 'POST') {
    return create(request, response);
  }
  return response.status(404);
}
