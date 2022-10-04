defmodule PushServiceWeb.RoomChannel do
  use Phoenix.Channel

  def join("room:lobby:" <> channel_id, _params, socket) do
    current_user = socket.assigns[:current_user]

    case PushServiceWeb.AuthHelper.can_listen_channel(%{
           "current_user" => current_user,
           "channel_id" => channel_id
         }) do
      {:ok} ->
        {:ok, assign(socket, :channel_id, channel_id)}

      {_} ->
        {:error, %{reason: "unauthorized"}}
    end
  end

  def join("room:topic:" <> thread_id, _params, socket) do
    current_user = socket.assigns[:current_user]

    case PushServiceWeb.AuthHelper.can_listen_thread(%{
           "current_user" => current_user,
           "thread_id" => thread_id
         }) do
      {:ok} ->
        {:ok, assign(socket, :thread_id, thread_id)}

      {_} ->
        {:error, %{reason: "unauthorized"}}
    end
  end

  def join("room:" <> community_id, _params, socket) do
    current_user = socket.assigns[:current_user]

    case PushServiceWeb.AuthHelper.can_listen_community(%{
           "current_user" => current_user,
           "community_id" => community_id
         }) do
      {:ok} ->
        {:ok, assign(socket, :community_id, community_id)}

      {_} ->
        {:error, %{reason: "unauthorized"}}
    end
  end

  def join("user:" <> user_id, _params, socket) do
    current_user = socket.assigns[:current_user]

    case PushServiceWeb.AuthHelper.can_listen_user(%{
           "current_user" => current_user,
           "user_id" => user_id
         }) do
      {:ok} ->
        {:ok, assign(socket, :user_id, user_id)}

      {_} ->
        {:error, %{reason: "unauthorized"}}
    end
  end

  def handle_in("new_msg", params, socket) do
    %{"token" => token} = params

    if(token == System.get_env("PUSH_SERVICE_KEY")) do
      broadcast!(socket, "new_msg", %{})
    end

    {:noreply, socket}
  end
end
