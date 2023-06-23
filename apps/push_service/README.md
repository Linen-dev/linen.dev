# PushService

The service is using elixir, so you need to set it up first.

- Install Elixir: https://elixir-lang.org/install.html

To start the push service:

- Create a secret i.e a string see .env.example
- Install dependencies with `mix deps.get`
- Start Phoenix endpoint with `AUTH_SERVICE_URL='YOUR_URL' PUSH_SERVICE_KEY='YOUR KEY' mix phx.server` or inside IEx with `iex -S mix phx.server`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.

Ready to run in production? Please [check our deployment guides](https://hexdocs.pm/phoenix/deployment.html).

## Learn more

- Official website: https://www.phoenixframework.org/
- Guides: https://hexdocs.pm/phoenix/overview.html
- Docs: https://hexdocs.pm/phoenix
- Forum: https://elixirforum.com/c/phoenix-forum
- Source: https://github.com/phoenixframework/phoenix

## Services are connected to push

How service works:

1. Client side is loaded with channel ids
2. Client joins the channels that it has access to
3. When someone sends a new message it hits the node api
4. Node api saves to the database and then sends a post request to Elixir push service with the following data:

```
  {
    channelId: '',
    messageObject: {
      someMessageObject
    }
  }
```

5. Based on who has subscribed to the channel id it broadcasts to all the clients that are connected to it
6. Client receives the new message and rerenders the new element in channel or inbox.
