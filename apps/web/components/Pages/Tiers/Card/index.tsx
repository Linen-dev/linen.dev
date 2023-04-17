import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';
import { Period } from 'components/Pages/Plans';

interface Props {
  active?: boolean;
  title?: string;
  description?: string;
  price?: number | string;
  period?: Period;
  children: React.ReactNode;
}

export default function Card({
  active,
  title,
  description,
  price,
  period,
  children,
}: Props) {
  const formattedPrice = Number(price);
  return (
    <div className={classNames(styles.card, { [styles.active]: active })}>
      {title && <div className={styles.title}>{title}</div>}
      {description && <div className={styles.description}>{description}</div>}
      {price && (
        <div className={styles.price}>
          {formattedPrice ? (
            <>
              $
              {period === Period.Yearly ? Math.ceil(Number(price) / 12) : price}
              <span className={styles.length}>/month</span>
            </>
          ) : (
            'Custom'
          )}
        </div>
      )}
      {children}
    </div>
  );
}
