import { useState } from 'react';
import { TextInput } from '@linen/ui';
import { GoPencil } from 'react-icons/go';
import classNames from 'classnames';
import styles from './index.module.css';
import { ThreadState } from '@linen/types';
import CheckIcon from 'components/icons/CheckIcon';

enum Mode {
  Edit,
  Read,
}

interface Props {
  title?: string | null;
  state: ThreadState;
  manage: boolean;
  onSetTitle(title: string): void;
}

function getTitle({
  title,
  closed,
}: {
  title?: string | null;
  closed?: boolean;
}): React.ReactNode {
  title = title || 'Title';
  if (closed) {
    return (
      <>
        <CheckIcon />
        {title}
      </>
    );
  }
  return title;
}

export default function Title({ title, state, manage, onSetTitle }: Props) {
  const [mode, setMode] = useState(Mode.Read);
  const text = getTitle({ title, closed: state === ThreadState.CLOSE });
  if (!manage) {
    return <div className={styles.title}>{text}</div>;
  }
  return (
    <div
      className={classNames(styles.title, 'cursor-pointer')}
      onClick={() => setMode(Mode.Edit)}
    >
      {mode === Mode.Edit && (
        <TextInput
          className="text-lg font-bold"
          id="title"
          defaultValue={title || ''}
          onBlur={(event) => {
            setMode(Mode.Read);
            onSetTitle(event.currentTarget.value);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              setMode(Mode.Read);
              onSetTitle(event.currentTarget.value);
            }
          }}
          autoFocus
        />
      )}
      {mode === Mode.Read && (
        <>
          {text}
          <GoPencil className={styles.icon} />
        </>
      )}
    </div>
  );
}
