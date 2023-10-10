import { Navigate } from 'react-router-dom';
import { localStorage } from '@linen/utilities/storage';

export default function RedirectToLastPageViewed() {
  const url = localStorage.get('pages_last');
  return <Navigate to={url || '/s/linen'} />;
}
