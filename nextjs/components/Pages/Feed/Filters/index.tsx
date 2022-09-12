import { ThreadState } from '@prisma/client';
import React from 'react';
import ButtonToggle from 'components/ButtonToggle';
import styles from './index.module.css';

interface Props {
  state: string;
  loading: boolean;
  onChange(type: string, value: string): void;
}

export default function Filters({ state, loading, onChange }: Props) {
  return (
    <div className={styles.filters}>
      <ButtonToggle
        value={state}
        options={[
          { label: 'Active', value: ThreadState.OPEN },
          { label: 'Closed', value: ThreadState.CLOSE },
        ]}
        onChange={(value: ThreadState) => onChange('state', value)}
      />
    </div>
  );
}
