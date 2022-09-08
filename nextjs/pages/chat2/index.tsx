import React, { useRef, useState } from 'react';

import { Channel, Socket } from 'phoenix';
import { useEffect } from 'react';

export default function Chat() {
  const [messages, setMessages] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [channel, setChannel] = useState<Channel>();
  const messagesRef = useRef(messages);

  useEffect(() => {
    const socket = new Socket('ws://localhost:4000/socket', {
      params: {
        token:
          'SFMyNTY.g2gDbQAAAAZzb21laWRuBgDzoIz6gQFiAAFRgA.51L54Q50ov8bZWhHDjbgVZ2n1wrUeapeMN87_cCPet8',
      },
    });

    socket.connect();
    const channel = socket.channel('room:lobby', {});

    setChannel(channel);
    channel
      .join()
      .receive('ok', (resp: any) => {
        console.log('Joined successfully', resp);
      })
      .receive('error', (resp: any) => {
        console.log('Unable to join', resp);
      });
    channel.on('new_msg', (payload) => {
      try {
        setMessages([...messagesRef.current, payload.body]);
        messagesRef.current = [...messagesRef.current, payload.body];
      } catch (e) {
        console.log(e);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSubmit = (event: any) => {
    // console.log({ state: state.value });
    console.log(message);
    // alert('A name was submitted: ' + this.state.value);
    try {
      //hit api backend
      channel?.push('new_msg', { body: message });
    } catch (e) {
      console.log({ e });
    }
    event.preventDefault();
    event.target.reset;
  };

  const handleChange = (event: any) => {
    setMessage(event.target.value);
  };

  return (
    <div>
      {messages.map((m: any) => (
        <ul key={m}>{m}</ul>
      ))}
      <form onSubmit={handleSubmit}>
        <label>
          <input
            className="border-2	"
            type="text"
            // value={this.state.value}
            onChange={handleChange}
          />
        </label>
        <input type="submit" value="Submit" />
      </form>
    </div>
  );
}
