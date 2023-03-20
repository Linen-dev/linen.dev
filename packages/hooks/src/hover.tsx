import React, { useEffect, useRef, useState, MutableRefObject } from 'react';

function useHover<T>(): [MutableRefObject<T>, boolean] {
  const [hover, setHover] = useState<boolean>(false);
  const ref: any = useRef<T | null>(null);
  const handleMouseOver = function () {
    setHover(true);
  };
  const handleMouseOut = function () {
    setHover(false);
  };
  useEffect(() => {
    const node: any = ref.current;
    if (node) {
      node.addEventListener('mouseover', handleMouseOver);
      node.addEventListener('mouseout', handleMouseOut);
      return () => {
        node.removeEventListener('mouseover', handleMouseOver);
        node.removeEventListener('mouseout', handleMouseOut);
      };
    }
  }, [ref.current]);
  return [ref, hover];
}

export default useHover;
