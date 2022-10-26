import { useEffect, useState } from 'react';
import debounce from 'utilities/debounce';

export enum Mode {
  Default,
  Drag,
}

export default function useMode() {
  const [mode, setMode] = useState<Mode>(Mode.Default);

  useEffect(() => {
    const onDragStart = debounce(() => setMode(Mode.Drag));
    const onDragEnd = debounce(() => setMode(Mode.Default));
    const onDrop = debounce(() => setMode(Mode.Default));
    const onDragOver = debounce((event: Event) => event.preventDefault());

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
