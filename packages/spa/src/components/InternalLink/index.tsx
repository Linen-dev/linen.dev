import { Link } from 'react-router-dom';

interface Props {
  className?: string;
  onClick?(): void;
  onDragEnter?(event: React.DragEvent): void;
  onDragLeave?(event: React.DragEvent): void;
  onDrop?(event: React.DragEvent): void;
  href: string;
  children: React.ReactNode;
  refresh?: boolean;
}

export default function InternalLink({
  communityName,
}: {
  communityName: string;
}) {
  return ({
    className,
    onClick,
    onDragEnter,
    onDragLeave,
    onDrop,
    href,
    children,
    refresh,
  }: Props) => {
    if (refresh) {
      return (
        <a
          href={`/s/${communityName}${href}`}
          onClick={onClick}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={className}
        >
          {children}
        </a>
      );
    }
    return (
      <Link
        to={`/s/${communityName}${href}`}
        onClick={onClick}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={className}
      >
        {children}
      </Link>
    );
  };
}
