defmodule PushServiceWeb.AuthHelper do
  use HTTPoison.Base
  require Logger

  def can_listen_community(%{"current_user" => current_user, "community_id" => community_id}) do
    push_token = Application.fetch_env!(:push_service, :push_service_key)
    api_url = Application.fetch_env!(:push_service, :auth_service_url)

    requestBody =
      Poison.encode!(%{
        push_token: push_token,
        current_user: current_user,
        community_id: community_id
      })

    case HTTPoison.post("#{api_url}/api/jwt/can", requestBody) do
      {:ok, %HTTPoison.Response{status_code: 200, body: _}} ->
        {:ok}

      {_, _} ->
        {:error}
    end
  end

  def can_listen_channel(%{"current_user" => current_user, "channel_id" => channel_id}) do
    push_token = Application.fetch_env!(:push_service, :push_service_key)
    api_url = Application.fetch_env!(:push_service, :auth_service_url)

    requestBody =
      Poison.encode!(%{
        push_token: push_token,
        current_user: current_user,
        channel_id: channel_id
      })

    case HTTPoison.post("#{api_url}/api/jwt/can", requestBody) do
      {:ok, %HTTPoison.Response{status_code: 200, body: _}} ->
        {:ok}

      {_, _} ->
        {:error}
    end
  end

  def can_listen_thread(%{"current_user" => current_user, "thread_id" => thread_id}) do
    push_token = Application.fetch_env!(:push_service, :push_service_key)
    api_url = Application.fetch_env!(:push_service, :auth_service_url)

    requestBody =
      Poison.encode!(%{
        push_token: push_token,
        current_user: current_user,
        thread_id: thread_id
      })

    case HTTPoison.post("#{api_url}/api/jwt/can", requestBody) do
      {:ok, %HTTPoison.Response{status_code: 200, body: _}} ->
        {:ok}

      {_, _} ->
        {:error}
    end
  end

  def can_listen_user(%{"current_user" => current_user, "user_id" => user_id}) do
    if "#{current_user}" == "#{user_id}" do
      {:ok}
    else
      {:error}
    end
  end

  def can_connect(%{"token" => token}) do
    push_token = Application.fetch_env!(:push_service, :push_service_key)
    api_url = Application.fetch_env!(:push_service, :auth_service_url)

    headers = [Authorization: "Bearer #{token}", Accept: "Application/json; Charset=utf-8"]

    requestBody =
      Poison.encode!(%{
        push_token: push_token
      })

    Logger.info(api_url)
    Logger.info(push_token)

    case HTTPoison.post("#{api_url}/api/jwt/who", requestBody, headers) do
      {:ok, %HTTPoison.Response{status_code: 200, body: body}} ->
        {:ok, body}

      {_, _} ->
        {:error}
    end
  end
end
