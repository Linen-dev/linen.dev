import stripe from 'services/stripe';
import { NextApiRequest, NextApiResponse } from 'next/types';

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
      // TODO update account to be premium
      console.log(data);
      break;
    case 'invoice.paid':
      // TODO update account to be premium
      console.log(data);
      break;
    case 'invoice.payment_failed':
      // TODO update account to be non premium
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
