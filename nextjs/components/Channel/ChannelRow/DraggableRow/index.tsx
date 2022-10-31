import React, { createRef } from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';
import { Mode } from 'hooks/mode';

interface Props {
  className?: string;
  draggable: boolean;
  children: React.ReactNode;
  id: string;
  mode?: Mode;
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

export default function DraggableRow({
  id,
  className,
  draggable,
  children,
  mode,
  onDrop,
}: Props) {
  const ref = createRef<HTMLDivElement>();
  if (!draggable || !onDrop) {
    return <div className={className}>{children}</div>;
  }
  function handleDragStart(event: React.DragEvent) {
    event.dataTransfer.setData(
      'text',
      JSON.stringify({
        source: 'thread',
        id,
      })
    );
  }

  function handleDragOver(event: React.DragEvent) {
    event?.preventDefault();
    return false;
  }

  function handleDragEnter(event: React.DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  function handleDrop(event: React.DragEvent) {
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

  const dragging = mode === Mode.Drag;

  return (
    <div
      className={classNames(className, {
        [styles.dragging]: dragging,
        [styles.dropzone]: dragging,
      })}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDrop={handleDrop}
      draggable
      ref={ref}
    >
      {children}
    </div>
  );
}
