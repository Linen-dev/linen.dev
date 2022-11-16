defmodule PushServiceWeb.HealthController do
  use PushServiceWeb, :controller
  action_fallback(PushServiceWeb.FallbackController)

  def index(conn, _params) do
    json(conn, %{status: 200})
  end
end
