defmodule PushServiceWeb.CommunityController do
  use PushServiceWeb, :controller
  action_fallback(PushServiceWeb.FallbackController)

  # use pattern matching
  def create(conn, params) do
    %{
      "community_id" => community_id,
      "channel_id" => channel_id,
      "thread_id" => thread_id,
      "message_id" => message_id,
      "imitation_id" => imitation_id,
      "is_thread" => is_thread,
      "is_reply" => is_reply,
      "token" => token
    } = params

    params = Map.delete(params, "token")

    if(token == System.get_env("PUSH_SERVICE_KEY")) do
      PushServiceWeb.Endpoint.broadcast!("room:" <> community_id, "new_msg", params)

      json(conn, %{status: 200})
    else
      json(conn, %{status: 400})
    end
  end
end
