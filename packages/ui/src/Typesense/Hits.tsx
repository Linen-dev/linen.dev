import { SerializedThread, Settings } from '@linen/types';
import { useHits, UseHitsProps } from 'react-instantsearch';
import { useState } from 'react';
import { Hits as HitsUI } from './ui/Hits';

export function Hits(props: UseHitsProps & { settings: Settings }) {
  const { hits } = useHits(props);
  const [preview, setPreview] = useState<SerializedThread>();

  return HitsUI({ hits, setPreview, preview, settings: props.settings });
}
