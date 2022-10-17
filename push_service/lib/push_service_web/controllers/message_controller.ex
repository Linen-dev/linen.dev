defmodule PushServiceWeb.MessageController do
  use PushServiceWeb, :controller
  action_fallback(PushServiceWeb.FallbackController)

  # use pattern matching
  def create(conn, params) do
    %{
      "thread_id" => thread_id,
      "token" => token
    } = params

    if(token == System.get_env("PUSH_SERVICE_KEY")) do
      PushServiceWeb.Endpoint.broadcast!("room:topic:" <> thread_id, "new_msg", params)

      json(conn, %{status: 200})
    else
      json(conn, %{status: 400})
    end
  end
end
