import { useEffect, useState } from 'react';

export enum Mode {
  Default,
  Drag,
}

export default function useMode() {
  const [mode, setMode] = useState<Mode>(Mode.Default);

  useEffect(() => {
    const onDragStart = () => {
      setMode(Mode.Drag);
    };
    const onDragEnd = () => {
      setMode(Mode.Default);
    };
    const onDrop = () => {
      setMode(Mode.Default);
    };
    const onDragOver = (event: Event) => event.preventDefault();

    document.addEventListener('dragstart', onDragStart);
    document.addEventListener('dragend', onDragEnd);
    document.addEventListener('drop', onDrop);
    document.addEventListener('dragover', onDragOver);

    return () => {
      document.removeEventListener('dragstart', onDragStart);
      document.removeEventListener('dragend', onDragEnd);
      document.removeEventListener('drop', onDrop);
      document.removeEventListener('dragover', onDragOver);
    };
  }, []);

  return { mode };
}
