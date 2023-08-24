import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';
import { highlightCode } from './utilities/highlight';

interface Props {
  content: string;
  highlight?: boolean;
  language?: string;
  block?: boolean;
  inline?: boolean;
  onClick(content: string): void;
}

function Code({
  content,
  language,
  highlight,
  inline,
  block,
  onClick,
}: Props): JSX.Element {
  const [highlighted, setHighlighted] = useState<any>();

  useEffect(() => {
    let mounted = true;
    if (highlight && !highlighted) {
      highlightCode(content, language).then((output) => {
        if (mounted) {
          setHighlighted(output);
        }
      });
    }
    return () => {
      mounted = false;
    };
  }, [highlight, highlighted, language]);

  if (highlighted) {
    return (
      <pre
        onClick={() => onClick(content)}
        className={classNames('hljs', styles.pre, {
          [styles.block]: block,
          [styles.inline]: inline,
        })}
      >
        <code
          className={styles.code}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </pre>
    );
  }

  return (
    <pre
      onClick={() => onClick(content)}
      className={classNames(styles.pre, {
        [styles.block]: block,
        [styles.inline]: inline,
      })}
    >
      <code className={styles.code}>{content}</code>
    </pre>
  );
}

export default Code;
