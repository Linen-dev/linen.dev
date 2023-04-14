import Stripe from 'stripe';
import type { NextApiRequest, NextApiResponse } from 'next';
import { buffer } from 'micro';
import { prisma } from '@linen/database';

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

async function promoteAccount(accountId: string) {
  return prisma.accounts.update({
    where: { id: accountId },
    data: {
      premium: true,
    },
  });
}

async function downgradeAccount(communityId: string) {
  return prisma.accounts.update({
    where: { id: communityId },
    data: {
      premium: false,
    },
  });
}

async function getCommunityId(event: any) {
  const { customer: customerId } = event.data.object as any;
  const customer = (await stripe.customers.retrieve(customerId)) as any;
  return customer.metadata.communityId;
}

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

  const communityId = await getCommunityId(event);

  switch (event.type) {
    case 'checkout.session.completed':
      await promoteAccount(communityId);
      break;
    case 'invoice.paid':
      await promoteAccount(communityId);
      break;
    case 'invoice.payment_failed':
      await downgradeAccount(communityId);
      break;

    default:
      console.error(`Unhandled event type ${event.type}`);
  }

  response.status(200).json({});
}
