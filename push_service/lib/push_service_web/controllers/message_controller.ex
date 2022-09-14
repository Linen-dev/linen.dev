defmodule PushServiceWeb.MessageController do
  use PushServiceWeb, :controller
  action_fallback PushServiceWeb.FallbackController

  def create(conn, %{"channel_id" => channel_id, "body" => body}) do
    PushServiceWeb.Endpoint.broadcast!("room:lobby:" <> channel_id, "new_msg", %{body: body})
    json(conn, %{body: 200})
  end
end
