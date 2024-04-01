import React, { useEffect, useState } from 'react';
import { SerializedAccount } from '@linen/types';
import styles from './index.module.scss';
import type { ApiClient } from '@linen/api-client';
import useAsyncFn from '@linen/hooks/useAsyncFn';
import Button from '@/Button';
import Label from '@/Label';
import TextInput from '@/TextInput';
import Toggle from '@/Toggle';
import StickyHeader from '@/StickyHeader';
import Toast from '@/Toast';
import { format } from '@linen/utilities/date';
import { FiTrash2 } from '@react-icons/all-files/fi/FiTrash2';
import ConfirmationModal from '@/ConfirmationModal';

export default function MatrixView({
  currentCommunity,
  api,
}: {
  currentCommunity: SerializedAccount;
  api: ApiClient;
}) {
  const [modal, setModal] = useState(false);
  const [{ value: keys }, callback] = useAsyncFn(() =>
    api.getIntegrationMatrix({ accountId: currentCommunity.id })
  );

  useEffect(() => {
    callback();
  }, []);

  return (
    <div className={styles.container}>
      <StickyHeader className={styles.header}>
        <div className={styles.title}>Matrix integration</div>
      </StickyHeader>

      <div className={styles.content}>
        {!keys ? (
          <div className={styles.italic}>Loading...</div>
        ) : keys?.length ? (
          <table className={styles.table}>
            <tr className={styles.tr}>
              <th>Server</th>
              <th>Enabled</th>
              <th>Created</th>
              <th>Updated</th>
              <th></th>
            </tr>
            <tbody className={styles.tbody}>
              {keys.map((k) => {
                return (
                  <tr key={k.id}>
                    <td>{k.matrixUrl}</td>
                    <td>
                      <div className={styles.toggle}>
                        <Toggle
                          checked={k.enabled}
                          onChange={async (val) => {
                            try {
                              await api.updateIntegrationMatrix({
                                accountId: currentCommunity.id,
                                enabled: val,
                                id: k.id,
                              });
                              await callback();
                            } catch (error) {
                              handleError(error);
                            }
                          }}
                        />
                      </div>
                    </td>
                    <td>{format(k.createdAt, 'Pp')}</td>
                    <td>{k.updatedAt ? format(k.updatedAt, 'Pp') : ''}</td>
                    <td>
                      <ConfirmationModal
                        title="Delete configuration"
                        description="Permanently delete this configuration?"
                        confirm="Delete"
                        open={modal}
                        close={() => {
                          setModal(false);
                        }}
                        onConfirm={async () => {
                          try {
                            await api.deleteIntegrationMatrix({
                              accountId: currentCommunity.id,
                              id: k.id,
                            });
                            await callback();
                          } catch (error) {
                            handleError(error);
                          } finally {
                            setModal(false);
                          }
                        }}
                      />
                      <Button
                        onClick={async () => {
                          setModal(true);
                        }}
                      >
                        <FiTrash2 />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className={styles.italic}>No integrations found</div>
        )}

        <div className={styles.formContainer}>
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              const form = event.target as any;
              const matrixUrl = form.matrixUrl.value;
              const matrixToken = form.matrixToken.value;
              try {
                await api.createIntegrationMatrix({
                  accountId: currentCommunity.id,
                  enabled: false,
                  matrixUrl,
                  matrixToken,
                });
                await callback();
              } catch (error) {
                handleError(error);
              }
            }}
            className={styles.form}
          >
            <Label htmlFor="name">Create a new integration</Label>
            <div style={{ padding: '0.25rem' }}></div>
            <TextInput
              id="matrixUrl"
              name="matrixUrl"
              placeholder="Integration Server (required)"
              required
            />
            <TextInput
              id="matrixToken"
              name="matrixToken"
              placeholder="Integration Token"
            />
            <div style={{ padding: '0.5rem' }}></div>
            <Button type="submit">Create</Button>
          </form>
        </div>
      </div>
    </div>
  );
}

function handleError(error: any) {
  Toast.error(
    error.status === 400
      ? JSON.parse(error.details)
          .map((c: any) => c.message)
          .join('\n')
      : 'Something went wrong'
  );
}
