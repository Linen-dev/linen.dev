import HandleError from '@/components/HandleError';
import { useRouteError } from 'react-router-dom';

export default function ErrorPage() {
  const error: any = useRouteError();
  return HandleError(error);
}
