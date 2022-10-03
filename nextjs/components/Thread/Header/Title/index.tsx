import { useState } from 'react';
import TextInput from 'components/TextInput';
import { GoPencil } from 'react-icons/go';
import classNames from 'classnames';
import styles from './index.module.css';
import { ThreadState } from '@prisma/client';

enum Mode {
  Edit,
  Read,
}

interface Props {
  title?: string | null;
  state: ThreadState;
  onSetTitle(title: string): void;
}

function getTitle({
  title,
  closed,
}: {
  title?: string | null;
  closed?: boolean;
}): string {
  title = title || 'Thread';
  if (closed) {
    return `[CLOSED] ${title}`;
  }
  return title;
}

export default function Title({ title, state, onSetTitle }: Props) {
  const [mode, setMode] = useState(Mode.Read);
  return (
    <div
      className={classNames(
        styles.title,
        'text-lg font-bold block cursor-pointer'
      )}
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
          {getTitle({ title, closed: state === ThreadState.CLOSE })}
          <GoPencil className={styles.icon} />
        </>
      )}
    </div>
  );
}
