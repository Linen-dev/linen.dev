defmodule PushServiceWeb.UserSocket do
  use Phoenix.Socket
  use HTTPoison.Base

  # A Socket handler
  #
  # It's possible to control the websocket connection and
  # assign values that can be accessed by your channel topics.

  ## Channels
  # Uncomment the following line to define a "room:*" topic
  # pointing to the `PushServiceWeb.RoomChannel`:
  #
  channel("room:*", PushServiceWeb.RoomChannel)
  channel("user*", PushServiceWeb.RoomChannel)

  #
  # To create a channel file, use the mix task:
  #
  #     mix phx.gen.channel Room
  #
  # See the [`Channels guide`](https://hexdocs.pm/phoenix/channels.html)
  # for further details.

  # Socket params are passed from the client and can
  # be used to verify and authenticate a user. After
  # verification, you can put default assigns into
  # the socket that will be set for all channels, ie
  #
  #     {:ok, assign(socket, :user_id, verified_user_id)}
  #
  # To deny connection, return `:error`.
  #
  # See `Phoenix.Token` documentation for examples in
  # performing token verification on connect.
  @impl true
  def connect(%{"token" => token}, socket, _connect_info) do
    case PushServiceWeb.AuthHelper.can_connect(%{
           "token" => token
         }) do
      {:ok, body} ->
        {:ok, assign(socket, :current_user, body)}

      {_, _} ->
        {:error, %{reason: "unauthorized"}}

      {_} ->
        {:error, %{reason: "unauthorized"}}
    end
  end

  @impl true
  def connect(_params, _socket, _connect_info), do: :error

  # Socket id's are topics that allow you to identify all sockets for a given user:
  #
  #     def id(socket), do: "user_socket:#{socket.assigns.user_id}"
  #
  # Would allow you to broadcast a "disconnect" event and terminate
  # all active sockets and channels for a given user:
  #
  #     Elixir.PushServiceWeb.Endpoint.broadcast("user_socket:#{user.id}", "disconnect", %{})
  #
  # Returning `nil` makes this socket anonymous.
  @impl true
  def id(_socket), do: nil
end
