import { NextApiRequest, NextApiResponse } from 'next/types';
import Stripe from 'stripe';
import PermissionsService from 'services/permissions';

const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: '2022-11-15',
});

function getMembersCount({ price }: { price: string }): string {
  if (price === '150' || price === '1500') {
    return '5,000';
  } else if (price === '200' || price === '2000') {
    return '10,000';
  } else if (price === '250' || price === '2500') {
    return '15,000';
  } else if (price === '300' || price === '3000') {
    return '20,000';
  }
  return 'Unlimited';
}

function serializeProduct(product: any) {
  const { id, name, description, metadata, default_price } = product;
  const { price, currency, period } = metadata;
  return {
    id,
    name,
    description,
    price,
    priceId: default_price,
    currency,
    period,
    features: [
      `Up to ${getMembersCount({ price })} members`,
      'Custom domain',
      'Custom branding',
      'SEO benefits',
      'Private communities',
      'Analytics',
      'Priority Support',
    ],
  };
}

export async function index({ period }: { period: string }) {
  const { data } = await stripe.products.list({ active: true });
  const plans = data
    .map(serializeProduct)
    .filter((product) => product.period === period)
    .sort((a, b) => Number(a.price) - Number(b.price));
  return { status: 200, data: { plans: plans } };
}

async function findOrCreateCustomer(communityId: string) {
  const { data } = await stripe.customers.search({
    query: `name:\'CUSTOMER ${communityId}\'`,
  });

  return (
    data[0] ||
    (await stripe.customers.create({
      name: `CUSTOMER ${communityId}`,
      metadata: {
        communityId,
      },
    }))
  );
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
  const customer = await findOrCreateCustomer(communityId);

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
    customer: customer.id,
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
  const period = request.query.period as string;
  const { status, data } = await index({ period });
  return response.status(status).json(data);
}
