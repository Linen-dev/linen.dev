import { useMedia } from './useMedia';

export const useViewport = () => {
  const viewport: 'desktop' | 'mobile' = useMedia(
    [
      '(min-width: 514px)',
      'screen and (min-width: 1px) and (max-width: 513px)',
    ],
    ['desktop', 'mobile'],
    'desktop'
  );

  return viewport;
};
