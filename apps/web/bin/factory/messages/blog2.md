# Building a chat app with Nextjs and Elixir

Table of content
1. Context: What is Linen.dev
2. Why did we choose Elixir
3. What is the architecture
4. What are trade offs that we had made

## Linen.dev and Context

Linen.dev is an open source Slack alternative for communities. We started out as a tool to sync Slack and Discord conversations to search-engine friendly website. We are now building a full fledged Slack alternative for communities. One core part of Linen is the real time chat. We started out building Linen with Nextjs mainly to take advantage of the server rendering functionality but because vercel hosting doesn’t have long running jobs we couldn’t use nextjs to setup WebSockets. Because of these constraints we had to find another solution for the WebSockets.

## Why did we choose Elixir

After some preliminary research we narrowed down our choose to 3 options:
1. A hosted websocket service like Pusher
2. A websocket service written in Nodejs with Socket.io
3. A websocket service written in Elixir with Phoenix

We wanted to open source Linen and eventually make it easy for developers to self host and didn't want to rely on a third party service. Which was why we didn't end up eliminating a service like pusher.Eventually it came down a decision between Socket.io and Elixir with Phoenix. Originally we were leaning towards Socket.io mainly because we could keep the same stack as the rest of the app. But after some more research we heard a bunch of negative feedback about Socket.io and one of our team members had a poor experience using Socket.io.Prior to working on Linen I built and maintained a fairly popular Elixir chat app called Papercups. I originally didn't intend Linen to be a real time chat app which was why I used Nextjs and node. Typically I would have stuck with node but our experience with WebSockets during our time working on the chat app was surprisingly smooth. We didn't have any issues with scaling and the performance was great. After some thought we decided to go with Elixir and Phoenix for the websocket service.

## Architecture

After doing some research we came up with the following architecture:

https://user-images.githubusercontent.com/4218509/200422983-21079c4a-bcb6-4f48-bf82-fdf9d01f1d3f.png

There were a two core decisions for the first version:
1. All write database interactions were happening with our existing node service.
2. Elixir was only responsible for maintaining a websocket and pushing real time notifications to the client. This lead to our Elixir service being very simple and lightweight. The only thing it was responsible for was broadcasting events to the client side given the proper channels. By keeping the scope of the Elixir service limited we didn’t need to duplicate a bunch of our JS code and rewrite it in Elixir. By design Elixir processes(Figure out right word) are very fault tolerant and a single failure will not cause failures in other services. One lesson we learned from our previous project was not to handle inserting data over phoneix channels/WebSockets. Sockets could disconnect which could cause messages to be dropped and security implications meant that Elixir had to understand a lot more of the scope and  permissioning logic. In total we have under 200 lines of custom Elixir code.

### Message sending flow

User logins and authenticates and connects to websocket and joins to the proper channels. Here is the full code example:

https://github.com/Linen-dev/linen.dev/blob/a3f74e80b05e6443ba44bd84a6c7af8017becd3f/nextjs/hooks/WebSockets/index.tsx#L13

```
function useWebSockets({ room, token, permissions, onNewMessage }: Props) {
  const [channel, setChannel] = useState<Channel>();
  const [connected, setConnected] = useState<boolean>(false);
  useEffect(() => {
    if (permissions.chat && token && room) {
      //Set url instead of hard coding
      const socket = new Socket(
        `${process.env.NEXT_PUBLIC_PUSH_SERVICE_URL}/socket`,
        { params: { token } }
      );

      socket.connect();
      const channel = socket.channel(room);

      setChannel(channel);
      channel
        .join()
        .receive('ok', () => {
          setConnected(true);
        })
        .receive('error', () => {
          setConnected(false);
        });
      channel.on('new_msg', onNewMessage);

      return () => {
        setConnected(false);
        socket.disconnect();
      };
    }

    return () => {};
  }, []);

  useEffect(() => {
    channel?.off('new_msg');
    channel?.on('new_msg', onNewMessage);
  }, [onNewMessage]);

  return { connected, channel };
}
```

- User sends a message to the node backend
- Client side does optimistic update and renders the text instantly

https://github.com/Linen-dev/linen.dev/blob/176659feee3c093ffd4fbec6541fa4d154ae9c45/nextjs/components/Pages/Channel/Content/sendMessageWrapper.tsx   

```
return fetch(`/api/messages/channel`, {
      method: 'POST',
      body: JSON.stringify({
        communityId,
        body: message,
        files,
        channelId,
        imitationId,
      }),
    });
  ...
```

- Node backend saves message to Postgres DB

https://github.com/Linen-dev/linen.dev/blob/176659feee3c093ffd4fbec6541fa4d154ae9c45/nextjs/pages/api/messages/channel.ts#L110

```
const thread = await prisma.threads.create({
    data: {
      channel: { connect: { id: channelId } },
      sentAt: sentAt.getTime(),
      lastReplyAt: sentAt.getTime(),
      messageCount: 1,
      messages,
    } as Prisma.threadsCreateInput
	...
  });
```

- Node backend sends the message that has been created to Elixir push service along with metadata of which channel it exists in

https://github.com/Linen-dev/linen.dev/blob/176659feee3c093ffd4fbec6541fa4d154ae9c45/nextjs/services/push/index.ts#L32

```
export const push = ({
  channelId,
  threadId,
  messageId,
  isThread,
  isReply,
  message,
  thread,
}: PushType) => {
  return request.post(`${pushURL}/api/message`).send({
    channel_id: channelId,
    thread_id: threadId,
    message_id: messageId,
    is_thread: isThread,
    is_reply: isReply,
    message,
    thread,
    token,
  });
};
```

- Elixir push service then pushes the message to all the users that have joined the channel

https://github.com/Linen-dev/linen.dev/blob/main/push_service/lib/push_service_web/controllers/channel_controller.ex#L6

```
def create(conn, params) do
  %{
    "channel_id" => channel_id,
    "token" => token
  } = params

  PushServiceWeb.Endpoint.broadcast!("room:lobby:" <> channel_id, "new_msg", params)
end
```

We’re using Phoenix channels which handles the broadcast automatically, see: https://hexdocs.pm/phoenix/channels.html for more information

```
def join("room:" <> community_id, _params, socket) do
  current_user = socket.assigns[:current_user]
    {:ok, assign(socket, :community_id, community_id)}
  end
end
```

## Limitations and trade offs

Going with Elixir there were a few downsides. Setting up deployment process was going to be annoying and we needed to make sure this separate service was secure. Finally this was something that wasn’t well documented and couldn’t find anyone that has attempted this so the architecture wasn’t clear.
