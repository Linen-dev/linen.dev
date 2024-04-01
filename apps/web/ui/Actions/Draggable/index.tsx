import React, { createRef } from 'react';
import type { Mode } from '@linen/hooks/mode';
import styles from './index.module.scss';

interface Props {
  className?: string;
  draggable: boolean;
  children: React.ReactNode;
  id: string;
  source: 'thread' | 'message';
  mode?: Mode;
}

export default function Draggable({
  id,
  className,
  draggable,
  source,
  children,
}: Props) {
  const ref = createRef<HTMLDivElement>();
  if (!draggable) {
    return (
      <div className={className} ref={ref}>
        {children}
      </div>
    );
  }
  function handleDragStart(event: React.DragEvent) {
    const node =
      document.getElementById('drag-image') || document.createElement('div');
    node.id = 'drag-image';
    node.style.position = 'absolute';
    node.style.background = '#1d4ed8';
    node.style.boxShadow = '0 3px 5px #ccc';
    node.style.color = 'white';
    node.style.display = 'flex';
    node.style.alignItems = 'center';
    node.style.fontWeight = '500';
    node.style.fontSize = '14px';
    node.style.padding = '0.5rem 1rem';
    node.style.left = '-999px';
    node.style.top = '-999px';
    node.style.cursor = 'grab';
    node.innerText = source === 'thread' ? 'Move thread' : 'Move message';

    document.body.appendChild(node);
    event.dataTransfer.effectAllowed = 'copyMove';
    event.dataTransfer.setData(
      'text',
      JSON.stringify({
        source,
        id,
      })
    );
    event.dataTransfer.setDragImage(node, 0, 0);
    (event.currentTarget as HTMLElement).style.cursor = 'grab';

    const element = ref.current as HTMLElement;
    element.classList.add(styles.dragged);
  }

  function handleDragEnd(event: React.DragEvent) {
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
  }

  return (
    <div
      className={className}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      draggable
      ref={ref}
    >
      {children}
    </div>
  );
}
