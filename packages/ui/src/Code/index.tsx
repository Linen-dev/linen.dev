import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';

interface Props {
  className?: string;
  content: string;
  highlight?: boolean;
  inline?: boolean;
}

function Code({ className, content, highlight, inline }: Props): JSX.Element {
  const [highlighted, setHighlighted] = useState<any>();

  useEffect(() => {
    let mounted = true;
    if (!highlighted) {
      import('highlight.js').then((hljs: any) => {
        if (mounted) {
          setHighlighted(hljs.default.highlightAuto(content));
        }
      });
    }
    return () => {
      mounted = false;
    };
  }, [highlighted]);

  if (highlighted) {
    return (
      <pre
        className={classNames('hljs', styles.pre, { [styles.inline]: inline })}
      >
        <code
          className={styles.code}
          dangerouslySetInnerHTML={{ __html: highlighted.value }}
        />
      </pre>
    );
  }

  return (
    <pre className={classNames({ [styles.inline]: inline })}>
      <code className={className}>{content}</code>
    </pre>
  );
}

export default Code;
