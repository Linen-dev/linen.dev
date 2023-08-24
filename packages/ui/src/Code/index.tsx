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
}

function Code({
  content,
  language,
  highlight,
  inline,
  block,
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

  if (!highlight) {
    return (
      <pre
        className={classNames(styles.pre, {
          [styles.block]: block,
          [styles.inline]: inline,
        })}
      >
        <code className={styles.code}>{content}</code>
      </pre>
    );
  }

  if (highlighted) {
    return (
      <pre
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
