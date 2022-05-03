import { NextApiRequest, NextApiResponse } from 'next/types';

const HOST = process.env.NEXTAUTH_URL || 'http://localhost:3000';

const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_API_KEY);

async function create(request: NextApiRequest, response: NextApiResponse) {
  const { accountId, priceId } = JSON.parse(request.body);
  if (!accountId) {
    return response.status(400).json({ error: 'accountId is required' });
  }
  if (!priceId) {
    return response.status(400).json({ error: 'priceId is required' });
  }

  let customer = null;
  // await stripe.customers.search({
  //   query: `name:\'CUSTOMER ${accountId}\'`,
  // })

  // if (!customer) {
  //   customer = await stripe.customers.create({
  //     name: `CUSTOMER ${accountId}`,
  //     metadata: {
  //       accountId
  //     }
  //   })
  // }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${HOST}/settings/plans?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${HOST}/settings/plans`,
    customer,
  });

  return response.status(200).json({
    redirectUrl: session.url,
  });
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
