import { Error403, Error404, Error500 } from '@linen/ui/Error';
import { localStorage } from '@linen/utilities/storage';

export default function HandleError(error: any) {
  localStorage.remove('pages_last');

  if (error.status === 403) {
    return <Error403 />;
  }
  if (error.status === 404) {
    return <Error404 />;
  }

  return <Error500 />;
}
