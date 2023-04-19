import { NextApiRequest, NextApiResponse } from 'next/types';
import Stripe from 'stripe';
import PermissionsService from 'services/permissions';

const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: '2022-11-15',
});

function serializeCustomer(data: any) {
  return {
    email: data.email,
  };
}

function serializeSubscription(data: any) {
  return {
    plan: {
      amount: data.plan.amount,
      interval: data.plan.interval,
    },
  };
}

function serializePaymentMethod(data: any) {
  return {
    type: data.type,
    card: {
      last4: data.card.last4,
    },
  };
}

export async function index({ communityId }: { communityId: string }) {
  const response1 = await stripe.customers.search({
    query: `metadata["communityId"]:"${communityId}"`,
  });
  const customer = response1.data[0];
  const response2 = await stripe.subscriptions.list({
    customer: customer.id,
  });
  const subscription = response2.data[0];
  const paymentMethodId = subscription.default_payment_method as string;
  const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
  return {
    status: 200,
    data: {
      customer: serializeCustomer(customer),
      subscription: serializeSubscription(subscription),
      paymentMethod: serializePaymentMethod(paymentMethod),
    },
  };
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const communityId = request.query.communityId as string;
  const permissions = await PermissionsService.get({
    request,
    response,
    params: {
      communityId,
    },
  });
  if (!permissions.manage) {
    return response.status(401).json({});
  }
  const { status, data } = await index({ communityId });
  return response.status(status).json(data);
}
