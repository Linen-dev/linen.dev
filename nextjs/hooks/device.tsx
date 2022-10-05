import { useState } from 'react';
import useResize from './resize';

function useDevice() {
  const [isMobile, setMobile] = useState(false);

  useResize({
    onResize() {
      if (window.innerWidth < 768) {
        setMobile(true);
      } else {
        setMobile(false);
      }
    },
  });

  return { isMobile };
}

export default useDevice;
