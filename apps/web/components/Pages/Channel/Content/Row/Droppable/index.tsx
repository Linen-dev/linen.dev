import React, { createRef, useState } from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';

interface Props {
  className?: string;
  children: React.ReactNode;
  id: string;
  onClick?(): void;
  onDrop?({
    source,
    target,
    from,
    to,
  }: {
    source: string;
    target: string;
    from: string;
    to: string;
  }): void;
}

export default function Droppable({
  id,
  className,
  children,
  onClick,
  onDrop,
}: Props) {
  const [hover, setHover] = useState(false);
  const ref = createRef<HTMLDivElement>();
  if (!onDrop) {
    return <div className={className}>{children}</div>;
  }

  function handleDragOver(event: React.DragEvent) {
    event.preventDefault();
    return false;
  }

  function handleDragEnter(event: React.DragEvent) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    setHover(true);
  }

  function handleDragLeave() {
    setHover(false);
  }

  function handleDrop(event: React.DragEvent) {
    setHover(false);
    const text = event.dataTransfer.getData('text');
    if (text) {
      const data = JSON.parse(text);
      if (data.id === id) {
        return event.stopPropagation();
      }
      return onDrop?.({
        source: data.source,
        target: 'thread',
        from: data.id,
        to: id,
      });
    }
  }

  return (
    <div
      id={id}
      className={classNames(className, styles.row, hover && styles.hover)}
      onClick={onClick}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      ref={ref}
    >
      {children}
    </div>
  );
}
