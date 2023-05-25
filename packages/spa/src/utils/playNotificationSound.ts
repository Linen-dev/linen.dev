import DI from '@/di';
import { Howl } from 'howler';

export const playNotificationSound = async (volume: number) => {
  try {
    const sound = new Howl({
      src: [DI.buildInternalUrl('alert.mp3')],
    });
    sound.volume(volume);
    sound.play();
  } catch (err) {
    console.error('Failed to play notification sound:', err);
  }
};
