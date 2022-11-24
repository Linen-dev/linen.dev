import { ThreadState } from '@prisma/client';
import React from 'react';
import { Button, ButtonToggle } from '@linen/ui';
import styles from './index.module.css';
import { Selections } from '../types';
import Pagination from './Pagination';
import ScopeSelect from './ScopeSelect';
import { GoComment, GoCheck, GoSync } from 'react-icons/go';
import type { Permissions } from '@linen/types';

interface Props {
  state: string;
  selections: Selections;
  page: number;
  total: number;
  defaultScope: string;
  permissions: Permissions;
  onChange(type: string, value: string): void;
  onUpdate(): void;
  onPageChange(type: string): void;
  isFetchingTotal: boolean;
}

function showActions(selections: Selections): boolean {
  for (const key in selections) {
    const selection = selections[key];
    if (selection?.checked) {
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
  defaultScope,
  permissions,
  onChange,
  onUpdate,
  onPageChange,
  isFetchingTotal,
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
        {permissions.is_member && (
          <ScopeSelect onChange={onChange} defaultValue={defaultScope} />
        )}
        {permissions.manage && showActions(selections) && (
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
      <div className={styles.group}>
        <Pagination
          page={page}
          total={total}
          onPageChange={onPageChange}
          isFetchingTotal={isFetchingTotal}
        />
      </div>
    </div>
  );
}
