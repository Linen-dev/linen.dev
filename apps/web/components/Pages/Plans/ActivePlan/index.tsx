import React, { useEffect, useState } from 'react';
import styles from './index.module.scss';
import { FiZap } from '@react-icons/all-files/fi/FiZap';
import { SerializedAccount } from '@linen/types';
import Table, { Tbody, Td } from 'components/Table';
import Spinner from '@linen/ui/Spinner';

interface Props {
  currentCommunity: SerializedAccount;
}

interface Customer {
  email: string;
}

export default function ActivePlan({ currentCommunity }: Props) {
  const [customer, setCustomer] = useState<Customer>();
  const [subscription, setSubscription] = useState<any>();
  useEffect(() => {
    fetch(`/api/subscriptions?communityId=${currentCommunity.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setCustomer(data.customer);
        setSubscription(data.subscription);
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
      {customer && subscription ? (
        <Table>
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
                {subscription.plan.interval === 'month' ? 'monthly' : 'yearly'}
              </Td>
            </tr>
          </Tbody>
        </Table>
      ) : (
        <Spinner className={styles.loader} />
      )}
    </div>
  );
}
