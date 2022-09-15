defmodule PushServiceWeb.MessageController do
  use PushServiceWeb, :controller
  action_fallback PushServiceWeb.FallbackController

  # use pattern matching
  def create(conn, %{"channel_id" => channel_id, "body" => body, "token" => token}) do
    if(token != System.get_env("PUSH_SERVICE_KEY")) do
      json(conn, %{status: 400})
    else
      PushServiceWeb.Endpoint.broadcast!("room:lobby:" <> channel_id, "new_msg", %{body: body})
      json(conn, %{status: 200})
    end
  end
end
