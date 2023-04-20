import { SerializedChannel } from '@linen/types';
import { createContext } from 'react';

export const ChannelContext = createContext<SerializedChannel | null>(null);
