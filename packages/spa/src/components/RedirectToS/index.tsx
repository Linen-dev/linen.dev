import { Navigate, useParams } from 'react-router-dom';

export default function RedirectToS() {
  const params = useParams();
  return <Navigate to={`/s/${params['*']}`} />;
}
