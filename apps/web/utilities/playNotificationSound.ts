export const playNotificationSound = async (volume: number) => {
  try {
    const file = 'https://static.main.linendev.com/public/alert.mp3';
    const audio = new Audio(file);

    if (audio) {
      audio.volume = volume;

      await audio.play();
    }
  } catch (err) {
    console.error('Failed to play notification sound:', err);
  }
};
