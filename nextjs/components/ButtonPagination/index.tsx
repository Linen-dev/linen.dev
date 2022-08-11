import classNames from 'classnames';
import styles from './index.module.css';

interface ButtonPaginationProps {
  href: string;
  label: string;
  className?: string;
}

export default function ButtonPagination({
  href,
  label,
  className,
}: ButtonPaginationProps) {
  return (
    <a href={href} className={classNames(styles.btn, className && className)}>
      {label}
    </a>
  );
}
