import React, { createRef } from 'react';
import classNames from 'classnames';
import { Mode } from 'hooks/mode';
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
    event.dataTransfer.setData(
      'text',
      JSON.stringify({
        source: 'thread',
        id,
      })
    );

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
    node.style.padding = '1rem';
    node.style.left = '-999px';
    node.style.top = '-999px';
    node.style.cursor = 'move';
    node.innerText = 'Move thread';

    document.body.appendChild(node);

    // background: $color-primary;
    // box-shadow: 0 1px 3px #ccc;
    // color: white;
    // font-weight: bold;
    // left: -999px;
    // padding: 1rem;
    // position: absolute;
    // top: -999px;
    // width: 160px;
    // height: 80px;
    // z-index: -1;
    event.dataTransfer.setDragImage(node, 0, 0);

    event.dataTransfer.effectAllowed = 'move';
    event.currentTarget.setAttribute('dragged', 'true');
  }

  function handleDragEnd(event: React.DragEvent) {
    event.currentTarget.setAttribute('dragged', 'false');
  }

  function handleDragOver(event: React.DragEvent) {
    event.preventDefault();
    return false;
  }

  function handleDragEnter(event: React.DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'move';
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

  return (
    <div
      className={classNames(className, styles.row)}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
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
