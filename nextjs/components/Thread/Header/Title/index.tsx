import { useState } from 'react';
import TextInput from 'components/TextInput';
import { GoPencil } from 'react-icons/go';
import classNames from 'classnames';
import styles from './index.module.css';
import { ThreadState } from '@prisma/client';
import { Permissions } from 'types/shared';
import CheckIcon from 'components/icons/CheckIcon';

enum Mode {
  Edit,
  Read,
}

interface Props {
  title?: string | null;
  state: ThreadState;
  permissions: Permissions;
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

export default function Title({
  title,
  state,
  permissions,
  onSetTitle,
}: Props) {
  const [mode, setMode] = useState(Mode.Read);
  const text = getTitle({ title, closed: state === ThreadState.CLOSE });
  if (!permissions.feed) {
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
