import React from 'react';
import classNames from 'classnames';
import { SerializedChannel } from '@linen/types';
import Toggle from 'components/Toggle';
import styles from './index.module.scss';

interface Props {
  channels: SerializedChannel[];
  onChange: (event: any) => Promise<void>;
}

export default function ChannelVisibilityRow({ channels, onChange }: Props) {
  return (
    <div className="flex">
      <div className="grow">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Channels visibility
        </h3>
        <div>
          <div className="text-sm text-gray-500">
            <p>Pick which channels to display or hide.</p>
          </div>
        </div>
        <div className={styles.toggles}>
          {channels.map((channel) => {
            const enabled = !channel.hidden;

            async function onChannelToggle(checked: boolean, id: string) {
              await onChange({ id, hidden: !checked });
            }

            return (
              <div className={styles.toggle} key={channel.id}>
                <label
                  className={classNames(
                    styles.label,
                    enabled ? styles.enabled : styles.disabled
                  )}
                >
                  <Toggle
                    checked={enabled}
                    onChange={(checked) => onChannelToggle(checked, channel.id)}
                  />
                  {channel.channelName}
                </label>

                <input
                  type="hidden"
                  name={channel.id}
                  value={enabled ? 'true' : 'false'}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
