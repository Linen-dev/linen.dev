import React, { createRef } from 'react';
import classNames from 'classnames';
import { Mode } from '@linen/hooks/mode';
import styles from './index.module.scss';

interface Props {
  className?: string;
  children: React.ReactNode;
  id: string;
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
  onDrop,
}: Props) {
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
    const node = ref.current as HTMLElement;
    node.classList.add(styles.hover);
  }

  function handleDragLeave() {
    const node = ref.current as HTMLElement;
    node.classList.remove(styles.hover);
  }

  function handleDrop(event: React.DragEvent) {
    const node = ref.current as HTMLElement;
    node.classList.remove(styles.hover);
    const text = event.dataTransfer.getData('text');
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

  return (
    <div
      className={classNames(className, styles.row)}
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
