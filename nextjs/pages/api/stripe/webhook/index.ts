import { buffer } from 'micro';
import prisma from 'client';
import stripe from 'services/stripe';
import { NextApiRequest, NextApiResponse } from 'next/types';
import { captureException, withSentry } from '@sentry/nextjs';

const secret = process.env.STRIPE_WEBHOOK_SECRET;

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

async function downgradeAccount(accountId: string) {
  return prisma.accounts.update({
    where: { id: accountId },
    data: {
      premium: false,
    },
  });
}

async function fetchAccountId(event: any) {
  const { customer: customerId } = event.data.object as any;
  const customer = (await stripe.customers.retrieve(customerId)) as any;
  return customer.metadata.accountId;
}

async function handler(request: NextApiRequest, response: NextApiResponse) {
  if (request.method === 'POST') {
    const body = await buffer(request);
    const signature = request.headers['stripe-signature'];

    if (!secret || !signature) {
      return response.status(400).json({ status: 'error' });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, secret);
    } catch (err) {
      captureException(err);
      return response.status(400).json({ status: 'error' });
    }

    const accountId = await fetchAccountId(event);

    switch (event.type) {
      case 'checkout.session.completed':
        await promoteAccount(accountId);
        break;
      case 'invoice.paid':
        await promoteAccount(accountId);
        break;
      case 'invoice.payment_failed':
        await downgradeAccount(accountId);
        break;
    }

    return response.status(200).json({ status: 'success' });
  }

  return response.status(405).json({ status: 'error' });
}

export default withSentry(handler);
