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
  const [hljs, setHljs] = useState<any>(null);

  useEffect(() => {
    import('highlight.js').then((hljs) => setHljs(hljs.default));
  }, []);

  if (!highlight || !hljs) {
    return (
      <pre className={classNames({ [styles.inline]: inline })}>
        <code className={className}>{content}</code>
      </pre>
    );
  }

  const highlighted = hljs.highlightAuto(content);

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

export default Code;
