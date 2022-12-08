import React, { Suspense } from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';

const Highlight = React.lazy(() => import('./Highlight'));

interface Props {
  className?: string;
  content: string;
  highlight?: boolean;
  inline?: boolean;
}

function Code({ className, content, highlight, inline }: Props): JSX.Element {
  if (!highlight) {
    return (
      <pre className={classNames(styles.pre, { [styles.inline]: inline })}>
        <code className={className}>{content}</code>
      </pre>
    );
  }

  return (
    <Suspense
      fallback={
        <pre className={classNames(styles.pre, { [styles.inline]: inline })}>
          <code className={className}>{content}</code>
        </pre>
      }
    >
      <Highlight content={content} inline={inline} />
    </Suspense>
  );
}

export default Code;
