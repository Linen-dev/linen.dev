import { Error403, Error404, Error500 } from '@linen/ui/Error';

export default function HandleError(error: any) {
  if (error.status === 403) {
    return <Error403 />;
  }
  if (error.status === 404) {
    return <Error404 />;
  }

  return <Error500 />;
}
