import Stripe from 'stripe';
import type { NextApiRequest, NextApiResponse } from 'next';
import { buffer } from 'micro';

const API_KEY = process.env.STRIPE_API_KEY as string;
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET as string;

const stripe = new Stripe(API_KEY, {
  apiVersion: '2022-11-15',
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const signature = request.headers['stripe-signature'] as string;
  const body = await buffer(request);

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
  } catch (exception) {
    return response.status(400).json({});
  }

  switch (event.type) {
    default:
      console.error(`Unhandled event type ${event.type}`);
  }

  response.status(200).json({});
}
