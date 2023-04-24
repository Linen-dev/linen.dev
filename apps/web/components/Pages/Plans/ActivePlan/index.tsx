import React, { useEffect, useState } from 'react';
import styles from './index.module.scss';
import { FiZap } from '@react-icons/all-files/fi/FiZap';
import { SerializedAccount } from '@linen/types';
import Table from '@linen/ui/Table';
import Tbody from '@linen/ui/Tbody';
import Td from '@linen/ui/Td';
import Spinner from '@linen/ui/Spinner';
import Link from 'components/Link';

interface Props {
  currentCommunity: SerializedAccount;
}

interface Customer {
  email: string;
}

export default function ActivePlan({ currentCommunity }: Props) {
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<Customer>();
  const [subscription, setSubscription] = useState<any>();
  const [paymentMethod, setPaymentMethod] = useState<any>();
  useEffect(() => {
    setLoading(true);
    fetch(`/api/subscriptions?communityId=${currentCommunity.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setLoading(false);
        setCustomer(data.customer);
        setSubscription(data.subscription);
        setPaymentMethod(data.paymentMethod);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h1 className={styles.header}>
        <span>
          <FiZap />
          Thank you!
        </span>
      </h1>
      <p className={styles.description}>
        Your subscription is currently active and you&apos;re on a premium plan.
      </p>
      {loading ? (
        <Spinner className={styles.loader} />
      ) : (
        <>
          {customer && (
            <>
              <Table monospaced>
                <Tbody>
                  <tr>
                    <Td>
                      <strong>Amount</strong>
                    </Td>
                    <Td>${subscription.plan.amount / 100}</Td>
                  </tr>
                  <tr>
                    <Td>
                      <strong>Billing address</strong>
                    </Td>
                    <Td>{customer.email}</Td>
                  </tr>
                  <tr>
                    <Td>
                      <strong>Billing cycle</strong>
                    </Td>
                    <Td>
                      {subscription.plan.interval === 'month'
                        ? 'monthly'
                        : 'yearly'}
                    </Td>
                  </tr>
                  <tr>
                    <Td>
                      <strong>Payment method</strong>
                    </Td>
                    <Td>{paymentMethod.type}</Td>
                  </tr>
                  {paymentMethod.type === 'card' && (
                    <tr>
                      <Td>
                        <strong>Card number</strong>
                      </Td>
                      <Td>.. .... .... .... .... {paymentMethod.card.last4}</Td>
                    </tr>
                  )}
                </Tbody>
              </Table>

              <div className={styles.manage}>
                <Link
                  href={`https://billing.stripe.com/p/login/00g9CMchu0ywgVOaEE?prefilled_email=${customer.email}`}
                >
                  Manage subscription
                </Link>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
