import { NextApiRequest, NextApiResponse } from 'next/types';
import Stripe from 'stripe';
import PermissionsService from 'services/permissions';
import { cors, preflight } from 'utilities/cors';
import { sendNotification } from 'services/slack';

const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: '2022-11-15',
});

function getMembersCount({ price }: { price: string }): string {
  if (price === '150' || price === '1500') {
    return '5,000';
  } else if (price === '250' || price === '2500') {
    return '20,000';
  } else if (price === '400' || price === '4000') {
    return 'Unlimited';
  }
  return '5,000';
}

function extraFeatures({ price }: { price: string }): string[] {
  if (price === '150' || price === '1500') {
    return ['Community Support'];
  } else if (price === '250' || price === '2500') {
    return ['Priority Support'];
  } else if (price === '400' || price === '4000') {
    return [
      '24-hour support response time',
      'Optional: Your company featured on the Linen.dev website and GitHub readme',
      'Prioritized feature requests',
    ];
  }
  return [];
}

function serializeProduct(product: any) {
  const { id, name, description, metadata, default_price } = product;
  const { price, period } = metadata;
  return {
    id,
    name,
    description,
    price,
    priceId: default_price,
    period,
    features: [
      `Up to ${getMembersCount({ price })} members`,
      'Google Indexable',
      'Unlimited history retention',
      'Branded community',
      'Custom domain',
      'Sitemap generation',
      'Import Slack and Discord conversations',
      ...extraFeatures({ price }),
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

async function findOrCreateCustomer(communityId: string, email: string) {
  const { data } = await stripe.customers.search({
    query: `metadata["communityId"]:"${communityId}"`,
  });

  return (
    data[0] ||
    (await stripe.customers.create({
      name: `CUSTOMER ${communityId}`,
      email,
      metadata: {
        email,
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
  const customer = await findOrCreateCustomer(communityId, email);

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    subscription_data: {
      trial_period_days: 14,
    },
    metadata: {
      communityId,
      email,
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
  if (request.method === 'OPTIONS') {
    return preflight(request, response, ['POST', 'GET']);
  }
  cors(request, response);

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
    if (!permissions.auth || !permissions.manage) {
      return response.status(401).end();
    }

    const email = permissions.auth.email;
    const url = await create({
      communityId,
      email,
      priceId,
      successUrl,
      cancelUrl,
    });
    if (url) {
      try {
        await sendNotification(`User ${email} is being redirected to stripe.`);
      } catch (exception) {
        console.error('Failed to send a notification: ', exception);
      }
      return response.status(200).json({ redirectUrl: url });
    }
    return response.status(500).json({});
  }
  if (request.method === 'GET') {
    const period = request.query.period as string;
    const { status, data } = await index({ period });
    return response.status(status).json(data);
  }
  return response.status(405).end();
}
