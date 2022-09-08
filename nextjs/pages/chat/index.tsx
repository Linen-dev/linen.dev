import React from 'react';

import { Channel, Socket } from 'phoenix';

export default class Chat extends React.Component {
  socket: Socket | null = null;
  channel: Channel | null = null;

  constructor(props: any) {
    super(props);
    this.state = { body: '', value: '', messages: [] };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async componentDidMount() {
    // Socket connection below only necessary for live view
    this.socket = new Socket('ws://localhost:4000/socket', {
      params: {
        token:
          'SFMyNTY.g2gDbQAAAAZzb21laWRuBgDzoIz6gQFiAAFRgA.51L54Q50ov8bZWhHDjbgVZ2n1wrUeapeMN87_cCPet8',
      },
    });

    this.socket.connect();
    let channel = this.socket.channel('room:lobby', {});
    this.channel = channel;
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
        this.setState({
          messages: [...this.state.messages, payload.body],
        });
        console.log('state', this.state);
      } catch (e) {
        console.log(e);
      }
    });

    console.log(this.socket);
  }

  handleSubmit(event: any) {
    console.log({ state: this.state.value });
    console.log(event);
    // alert('A name was submitted: ' + this.state.value);
    try {
      //hit api backend
      this.channel?.push('new_msg', { body: this.state.value });
    } catch (e) {
      console.log({ e });
    }
    event.preventDefault();
    event.target.reset;
  }

  handleChange(event: any) {
    this.setState({ value: event.target.value });
  }

  render() {
    const listItems = this.state.messages.map((m: any) => <ul key={m}>{m}</ul>);

    return (
      <div>
        {listItems}
        <form onSubmit={this.handleSubmit}>
          <label>
            <input
              className="border-2	"
              type="text"
              // value={this.state.value}
              onChange={this.handleChange}
            />
          </label>
          <input type="submit" value="Submit" />
        </form>
      </div>
    );
  }
}
