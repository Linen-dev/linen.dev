defmodule PushServiceWeb.UserController do
  use PushServiceWeb, :controller
  action_fallback(PushServiceWeb.FallbackController)

  # use pattern matching
  def create(conn, params) do
    %{
      "user_id" => user_id,
      "token" => token
    } = params

    params = Map.delete(params, "token")

    if(token == System.get_env("PUSH_SERVICE_KEY")) do
      PushServiceWeb.Endpoint.broadcast!("user:" <> user_id, "new_msg", params)

      json(conn, %{status: 200})
    else
      json(conn, %{status: 400})
    end
  end
end
