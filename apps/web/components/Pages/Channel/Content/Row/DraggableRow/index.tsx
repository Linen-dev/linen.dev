import React, { createRef } from 'react';
import classNames from 'classnames';
import { Mode } from '@linen/hooks/mode';
import styles from './index.module.scss';

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
    const node =
      document.getElementById('drag-image') || document.createElement('div');
    node.id = 'drag-image';
    node.style.position = 'absolute';
    node.style.background = '#0855f4';
    node.style.borderRadius = '4px';
    node.style.boxShadow = '0 3px 5px #ccc';
    node.style.color = 'white';
    node.style.display = 'flex';
    node.style.alignItems = 'center';
    node.style.fontWeight = 'bold';
    node.style.fontSize = '14px';
    node.style.padding = '0.5rem 1rem';
    node.style.left = '-999px';
    node.style.top = '-999px';
    node.style.cursor = 'grab';
    node.innerText = 'Move thread';

    document.body.appendChild(node);
    event.dataTransfer.effectAllowed = 'copyMove';
    event.dataTransfer.setData(
      'text',
      JSON.stringify({
        source: 'thread',
        id,
      })
    );
    event.dataTransfer.setDragImage(node, 0, 0);

    const element = ref.current as HTMLElement;
    element.classList.add(styles.dragged);
  }

  function handleDragEnd() {
    const element = ref.current as HTMLElement;
    element.classList.remove(styles.dragged);
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
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      draggable
      ref={ref}
    >
      {children}
    </div>
  );
}
