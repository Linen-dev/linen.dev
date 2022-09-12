import { ThreadState } from '@prisma/client';
import React from 'react';
import NativeSelect from 'components/NativeSelect';
import styles from './index.module.css';
import { AiOutlineMessage } from 'react-icons/ai';

interface Props {
  state: string;
  loading: boolean;
  onChange(type: string, value: string): void;
}

export default function Filters({ state, loading, onChange }: Props) {
  return (
    <div className={styles.filters}>
      <div className={styles.state}>
        <NativeSelect
          id="state"
          icon={<AiOutlineMessage />}
          value={state}
          onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
            onChange('state', event.target.value)
          }
          options={[
            { label: 'Active', value: ThreadState.OPEN },
            { label: 'Closed', value: ThreadState.CLOSE },
          ]}
        />
      </div>
    </div>
  );
}
