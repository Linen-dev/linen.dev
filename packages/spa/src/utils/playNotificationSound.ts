export const playNotificationSound = async (volume: number) => {
  try {
    const file = '/alert.mp3';
    const audio = new Audio(file);
    audio.volume = volume;

    await audio?.play();
  } catch (err) {
    console.error('Failed to play notification sound:', err);
  }
};
