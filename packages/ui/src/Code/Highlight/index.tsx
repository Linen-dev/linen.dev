import React from 'react';
import classNames from 'classnames';
import hljs from 'highlight.js';
import styles from './index.module.scss';

interface Props {
  content: string;
  inline?: boolean;
}

function Highlight({ content, inline }: Props): JSX.Element {
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

export default Highlight;
