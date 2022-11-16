defmodule PushServiceWeb.ChannelController do
  use PushServiceWeb, :controller
  action_fallback(PushServiceWeb.FallbackController)

  # use pattern matching
  def create(conn, params) do
    %{
      "channel_id" => channel_id,
      "token" => token
    } = params

    params = Map.delete(params, "token")

    if(token == System.get_env("PUSH_SERVICE_KEY")) do
      PushServiceWeb.Endpoint.broadcast!("room:lobby:" <> channel_id, "new_msg", params)

      json(conn, %{status: 200})
    else
      json(conn, %{status: 400})
    end
  end
end
