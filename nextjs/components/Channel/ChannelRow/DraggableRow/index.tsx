import React, { createRef } from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';
import { Mode } from 'hooks/mode';

interface Props {
  className?: string;
  overClassName: string;
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
  overClassName,
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
    const node = ref.current as HTMLDivElement;
    node.classList.add(overClassName);
  }

  function handleDragLeave() {
    const node = ref.current as HTMLDivElement;
    node.classList.remove(overClassName);
  }

  function handleDragEnd() {
    const node = ref.current as HTMLDivElement;
    node.classList.remove(overClassName);
  }

  function handleDrop(event: React.DragEvent) {
    const node = ref.current as HTMLDivElement;
    node.classList.remove(overClassName);
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
      className={classNames(className, {
        [styles.dragging]: mode === Mode.Drag,
      })}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragEnd={handleDragEnd}
      onDrop={handleDrop}
      draggable
      ref={ref}
    >
      {children}
    </div>
  );
}
