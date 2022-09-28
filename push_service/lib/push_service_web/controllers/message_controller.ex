defmodule PushServiceWeb.MessageController do
  use PushServiceWeb, :controller
  action_fallback(PushServiceWeb.FallbackController)

  # use pattern matching
  def create(conn, %{
        "channel_id" => channel_id,
        "imitation_id" => imitation_id,
        "message_id" => message_id,
        "thread_id" => thread_id,
        "is_thread" => is_thread,
        "is_reply" => is_reply,
        "token" => token
      }) do
    if(token == System.get_env("PUSH_SERVICE_KEY")) do
      PushServiceWeb.Endpoint.broadcast!("room:lobby:" <> channel_id, "new_msg", %{
        "channel_id" => channel_id,
        "imitation_id" => imitation_id,
        "message_id" => message_id,
        "thread_id" => thread_id,
        "is_thread" => is_thread,
        "is_reply" => is_reply
      })

      json(conn, %{status: 200})
    else
      json(conn, %{status: 400})
    end
  end
end
