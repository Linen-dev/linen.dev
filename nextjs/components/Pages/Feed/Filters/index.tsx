import { ThreadState } from '@prisma/client';
import React from 'react';
import ButtonToggle from 'components/ButtonToggle';
import Button from 'components/Button';
import styles from './index.module.css';
import { Selections } from '../types';

interface Props {
  state: string;
  selections: Selections;
  onChange(type: string, value: string): void;
}

function isAnyRowSelected(selections: Selections): boolean {
  for (const key in selections) {
    const selection = selections[key];
    if (selection) {
      return true;
    }
  }
  return false;
}

export default function Filters({ state, selections, onChange }: Props) {
  return (
    <div className={styles.filters}>
      <ButtonToggle
        className={styles.filter}
        value={state}
        options={[
          { label: 'Active', value: ThreadState.OPEN },
          { label: 'Closed', value: ThreadState.CLOSE },
        ]}
        onChange={(value: ThreadState) => onChange('state', value)}
      />
      {isAnyRowSelected(selections) && (
        <Button className={styles.filter} size="xs" rounded="full">
          Close
        </Button>
      )}
    </div>
  );
}
