import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';
import { highlightCode } from './utilities/highlight';

interface Props {
  className?: string;
  content: string;
  highlight?: boolean;
  inline?: boolean;
}

function Code({ className, content, highlight, inline }: Props): JSX.Element {
  const [highlighted, setHighlighted] = useState<any>();

  // useEffect(() => {
  //   let mounted = true;
  //   if (highlight && !highlighted) {
  //     highlightCode(content).then((output) => {
  //       if (mounted) {
  //         setHighlighted(output);
  //       }
  //     });
  //   }
  //   return () => {
  //     mounted = false;
  //   };
  // }, [highlight, highlighted]);

  if (!highlight) {
    return (
      <pre className={classNames({ [styles.inline]: inline })}>
        <code className={className}>{content}</code>
      </pre>
    );
  }

  if (highlighted) {
    return (
      <pre
        className={classNames('hljs', styles.pre, { [styles.inline]: inline })}
      >
        <code
          className={styles.code}
          dangerouslySetInnerHTML={{ __html: highlighted }}
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
