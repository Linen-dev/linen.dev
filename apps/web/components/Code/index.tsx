import React from 'react';
import hljs from 'highlight.js';
import styles from './index.module.css';
import classNames from 'classnames';

interface Props {
  className?: string;
  content: string;
  highlight?: boolean;
  inline?: boolean;
}

function Code({ className, content, highlight, inline }: Props): JSX.Element {
  if (!highlight) {
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
