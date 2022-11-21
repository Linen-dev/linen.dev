import React from 'react';
import classNames from 'classnames';
import Title from './Title';
import Subtitle from './Subtitle';
import styles from './index.module.scss';

interface Props {
  className?: string;
  children: React.ReactNode;
}

function StickyHeader({ className, children }: Props) {
  return <div className={classNames(styles.header, className)}>{children}</div>;
}

StickyHeader.Title = Title;
StickyHeader.Subtitle = Subtitle;

export default StickyHeader;
