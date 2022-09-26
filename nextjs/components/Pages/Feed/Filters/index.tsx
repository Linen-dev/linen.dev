import { ThreadState } from '@prisma/client';
import React from 'react';
import ButtonToggle from 'components/ButtonToggle';
import Button from 'components/Button';
import styles from './index.module.css';
import { Selections } from '../types';
import Pagination from './Pagination';

interface Props {
  state: string;
  selections: Selections;
  page: number;
  total: number;
  onChange(type: string, value: string): void;
  onUpdate(): void;
  onPageChange(type: string): void;
}

function showActions(selections: Selections): boolean {
  for (const key in selections) {
    const selection = selections[key];
    if (selection) {
      return true;
    }
  }
  return false;
}

export default function Filters({
  state,
  selections,
  page,
  total,
  onChange,
  onUpdate,
  onPageChange,
}: Props) {
  return (
    <div className={styles.filters}>
      <div className={styles.group}>
        <ButtonToggle
          className={styles.filter}
          value={state}
          options={[
            { label: 'Active', value: ThreadState.OPEN },
            { label: 'Closed', value: ThreadState.CLOSE },
          ]}
          onChange={(value: ThreadState) => onChange('state', value)}
        />
        {showActions(selections) && (
          <Button
            className={styles.filter}
            size="xs"
            rounded="full"
            onClick={onUpdate}
          >
            {state === ThreadState.OPEN ? 'Close' : 'Reopen'}
          </Button>
        )}
      </div>
      <Pagination page={page} total={total} onPageChange={onPageChange} />
    </div>
  );
}
