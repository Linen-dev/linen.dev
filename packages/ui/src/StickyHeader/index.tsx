import React from 'react';
import classNames from 'classnames';
import Title from './Title';
import Subtitle from './Subtitle';
import styles from './index.module.scss';

interface Props {
  id?: string;
  className?: string;
  children: React.ReactNode;
}

function StickyHeader({ id, className, children }: Props) {
  return (
    <div id={id} className={classNames(styles.header, className)}>
      {children}
    </div>
  );
}

StickyHeader.Title = Title;
StickyHeader.Subtitle = Subtitle;

export default StickyHeader;
