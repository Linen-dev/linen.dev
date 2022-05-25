import React from 'react';
import hljs from 'highlight.js';
import styles from './index.module.css';

interface Props {
  className?: string;
  content: string;
  highlight?: boolean;
}

function Code({ className, content, highlight }: Props): JSX.Element {
  if (!highlight) {
    return (
      <pre>
        <code className={className}>{content}</code>
      </pre>
    );
  }
  const highlighted = hljs.highlightAuto(content);

  return (
    <pre className={`hljs ${styles.pre}`}>
      <code
        className={styles.code}
        dangerouslySetInnerHTML={{ __html: highlighted.value }}
      />
    </pre>
  );
}

export default Code;
