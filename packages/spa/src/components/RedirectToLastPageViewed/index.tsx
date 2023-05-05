import { useLinenStore } from '../../store';
import { Navigate } from 'react-router-dom';

export default function RedirectToLastPageViewed() {
  const communityName = useLinenStore((state) => state.communityName);
  const channelName = useLinenStore((state) => state.channelName);

  return (
    <Navigate
      to={`/s/${communityName || 'linen'}${
        !!channelName ? '/c/' + channelName : ''
      }`}
    />
  );
}
