import React, { useEffect, useState } from 'react';
import Button from '@/Button';
import Modal from '@/Modal';
import styles from './index.module.scss';
import { qs } from '@linen/utilities/url';
import TextInput from '@/TextInput';
import Label from '@/Label';
import useAsyncFn from '@linen/hooks/useAsyncFn';
import Toast from '@/Toast';

interface Props {
  open: boolean;
  close(): void;
  accountId: string;
}

export default function ApiKeysModal({ open, close, accountId }: Props) {
  const [result, setResult] = useState();
  const [{ value: keys }, callback] = useAsyncFn(() =>
    fetch(`/api/api-keys?${qs({ accountId })}`).then((resp) => resp.json())
  );

  function onSubmit(): React.FormEventHandler<HTMLFormElement> | undefined {
    return async (event) => {
      event.preventDefault();
      const form = event.target as any;
      const name = form.name.value;
      const scope = form.scope.value.split(',');
      try {
        const result = await fetch('/api/api-keys', {
          method: 'post',
          body: JSON.stringify({
            name,
            scope,
            accountId,
          }),
          headers: {
            'content-type': 'application/json',
          },
        });
        if (result.ok) {
          callback();
          const { token } = await result.json();
          setResult(token);
        }
      } catch (error) {
        console.error(error);
      }
    };
  }

  useEffect(() => {
    if (open) {
      callback();
    }
  }, [open]);

  return (
    <Modal open={open} close={close} size="lg">
      <div className={styles.gap}>
        <h3 className={styles.header}>Api Keys</h3>
        <table style={{ width: '100%' }}>
          <tr style={{ fontWeight: 'bolder' }}>
            <th>Alias</th>
            <th>Scope</th>
            <th></th>
          </tr>

          <tbody>
            {keys?.map((k: any) => {
              return (
                <tr key={k.id}>
                  <td>{k.name}</td>
                  <td>{k.scope}</td>
                  <td>
                    <Button
                      onClick={async () => {
                        const deleteReq = await fetch('/api/api-keys', {
                          method: 'delete',
                          body: JSON.stringify({
                            id: k.id,
                            accountId,
                          }),
                          headers: {
                            'content-type': 'application/json',
                          },
                        });
                        if (deleteReq.ok) {
                          callback();
                        } else {
                          Toast.error('Something went wrong');
                          console.log(await deleteReq.json());
                        }
                      }}
                    >
                      Revoke
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={{ fontStyle: 'italic' }}>
          For security purposes, tokens can only be viewed once, when created.
          If you forgot or lost access to your token, please regenerate a new
          one.
        </div>
        <form onSubmit={onSubmit()}>
          <Label htmlFor="name">Create a new Api Key</Label>
          <TextInput id="name" name="name" placeholder="Alias" required />
          <TextInput
            id="scope"
            name="scope"
            placeholder="Scope"
            type="hidden"
            value="full"
          />
          <Button type="submit">Create</Button>
          {result && (
            <>
              <Label htmlFor="token">Token</Label>
              <TextInput id="token" name="token" readOnly value={result} />
            </>
          )}
        </form>
      </div>
    </Modal>
  );
}
