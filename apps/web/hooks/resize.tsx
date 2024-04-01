import { useEffect } from 'react';

interface Props {
  onResize(): void;
}

function useResize({ onResize }: Props) {
  useEffect(() => {
    onResize();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);
}

export default useResize;
