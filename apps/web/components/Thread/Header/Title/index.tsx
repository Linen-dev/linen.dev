import React, { useState } from 'react';
import { Icon, TextInput } from '@linen/ui';
import { FiEdit } from '@react-icons/all-files/fi/FiEdit';
import classNames from 'classnames';
import styles from './index.module.css';
import { ThreadState } from '@linen/types';
import CheckIcon from 'components/icons/CheckIcon';
import useKeyboard from '@linen/hooks/keyboard';

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

const INPUT_ID = 'thread-title';

export default function Title({ title, state, manage, onSetTitle }: Props) {
  const [mode, setMode] = useState(Mode.Read);
  const text = getTitle({ title, closed: state === ThreadState.CLOSE });

  useKeyboard(
    {
      onKeyUp(event) {
        const node = event.target as HTMLInputElement;
        if (
          node?.id === INPUT_ID &&
          event.key === 'Escape' &&
          mode === Mode.Edit
        ) {
          event.preventDefault();
          event.stopPropagation();
          setMode(Mode.Read);
        }
      },
    },
    [mode]
  );

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
          id={INPUT_ID}
          defaultValue={title || ''}
          onBlur={(event: React.ChangeEvent<HTMLInputElement>) => {
            setMode(Mode.Read);
            onSetTitle(event.currentTarget.value);
          }}
          onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
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
          <FiEdit />
        </>
      )}
    </div>
  );
}
