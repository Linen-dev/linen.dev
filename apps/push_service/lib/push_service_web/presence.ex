defmodule PushServiceWeb.Presence do
  use Phoenix.Presence,
    otp_app: :push_service,
    pubsub_server: PushService.PubSub
end
