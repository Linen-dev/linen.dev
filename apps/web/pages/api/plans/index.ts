import { NextApiRequest, NextApiResponse } from 'next/types';
import Stripe from 'stripe';
import PermissionsService from 'services/permissions';

const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: '2022-11-15',
});

function serializeProduct(product: any) {
  const { id, name, description, metadata, default_price } = product;
  const { price, currency } = metadata;
  return {
    id,
    name,
    description,
    price,
    priceId: default_price,
    currency,
    features: [
      'Up to 10,000 members',
      'Custom domain',
      'Custom branding',
      'SEO benefits',
      'Private communities',
      'Analytics',
      'Priority Support',
    ],
    prices: {
      monthly: price,
      yearly: 2000,
    },
  };
}

export async function index() {
  const { data } = await stripe.products.list({ active: true });
  const plans = data
    .map(serializeProduct)
    .sort((a, b) => Number(a.price) - Number(b.price));
  return { status: 200, data: { plans: plans } };
}

export async function create({
  email,
  communityId,
  priceId,
  successUrl,
  cancelUrl,
}: {
  email: string;
  communityId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: email,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    metadata: {
      communityId,
    },
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
  });
  return session.url;
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === 'POST') {
    const { communityId, priceId, successUrl, cancelUrl } = request.body;
    if (!communityId || !priceId || !successUrl || !cancelUrl) {
      return response.status(400).json({});
    }
    const permissions = await PermissionsService.get({
      request,
      response,
      params: { communityId },
    });
    if (!permissions.manage) {
      return response.status(401).end();
    }
    const email = permissions.user.email;
    const url = await create({
      communityId,
      email,
      priceId,
      successUrl,
      cancelUrl,
    });
    if (url) {
      return response.redirect(303, url);
    }
    return response.status(500).json({});
  }
  const { status, data } = await index();
  return response.status(status).json(data);
}
