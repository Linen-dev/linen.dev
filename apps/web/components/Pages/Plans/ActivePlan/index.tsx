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
      {customer ? (
        <Table>
          <Tbody>
            <tr>
              <Td>
                <strong>Billing address</strong>
              </Td>
              <Td>{customer.email}</Td>
            </tr>
          </Tbody>
        </Table>
      ) : (
        <Spinner className={styles.loader} />
      )}
    </div>
  );
}
