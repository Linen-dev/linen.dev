import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';
import { useInView } from 'react-intersection-observer';

interface Props {
  className?: string;
  content: string;
  highlight?: boolean;
  inline?: boolean;
}

function Code({ className, content, highlight, inline }: Props): JSX.Element {
  const { ref, inView } = useInView({ threshold: 0, skip: !highlight });
  const [highlighted, setHighlighted] = useState<any>();

  useEffect(() => {
    let mounted = true;
    if (!highlighted && inView) {
      import('highlight.js').then((hljs: any) => {
        if (mounted) {
          setHighlighted(hljs.default.highlightAuto(content));
        }
      });
    }
    return () => {
      mounted = false;
    };
  }, [highlighted, inView]);

  if (highlighted && inView) {
    return (
      <pre
        ref={ref}
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
    <pre ref={ref} className={classNames({ [styles.inline]: inline })}>
      <code className={className}>{content}</code>
    </pre>
  );
}

export default Code;
