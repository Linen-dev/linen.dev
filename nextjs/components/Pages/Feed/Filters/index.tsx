import { ThreadState } from '@prisma/client';
import React from 'react';
import ButtonToggle from 'components/ButtonToggle';
import Button from 'components/Button';
import styles from './index.module.css';
import { Selections } from '../types';
import Pagination from './Pagination';
import { GoComment, GoCheck, GoSync } from 'react-icons/go';

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
            {
              label: 'Active',
              icon: <GoComment />,
              value: ThreadState.OPEN,
            },
            { label: 'Closed', icon: <GoCheck />, value: ThreadState.CLOSE },
          ]}
          onChange={(value: ThreadState) => onChange('state', value)}
        />
        {showActions(selections) && (
          <Button
            color="gray"
            className={styles.filter}
            size="xs"
            onClick={onUpdate}
          >
            {state === ThreadState.OPEN ? (
              <>
                <GoCheck /> Close
              </>
            ) : (
              <>
                <GoSync /> Reopen
              </>
            )}
          </Button>
        )}
      </div>
      <Pagination page={page} total={total} onPageChange={onPageChange} />
    </div>
  );
}
