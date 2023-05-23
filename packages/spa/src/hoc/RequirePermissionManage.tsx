import Loading from '@/components/Loading';
import { useLinenStore } from '@/store';
import HandleError from '@/components/HandleError';

export default function RequirePermissionManage({
  children,
}: {
  children: JSX.Element;
}) {
  const inboxProps = useLinenStore((state) => state.inboxProps);

  if (!inboxProps) {
    return <Loading />;
  }

  if (!inboxProps.permissions.manage) {
    return HandleError({ status: 403 });
  }

  return children;
}
