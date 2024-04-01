import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';

function Card({
  children,
  readOnly = false,
  className = '',
}: {
  children: React.ReactNode;
  readOnly?: boolean;
  className?: string;
}) {
  return (
    <div
      className={classNames(
        { [styles.pointerEventsNone]: readOnly },
        className
      )}
    >
      {children}
    </div>
  );
}

export function PremiumCard({
  children,
  isPremium = false,
  className = '',
}: {
  children: React.ReactNode;
  isPremium?: boolean;
  className?: string;
}) {
  return (
    <Card readOnly={!isPremium} className={className}>
      {children}
    </Card>
  );
}
