defmodule PushServiceWeb.AuthHelper do
  use HTTPoison.Base
  require Logger

  @push_token System.get_env("PUSH_SERVICE_KEY")
  @api_url System.get_env("AUTH_SERVICE_URL")

  def can_listen_community(%{"current_user" => current_user, "community_id" => community_id}) do
    requestBody =
      Poison.encode!(%{
        push_token: @push_token,
        current_user: current_user,
        community_id: community_id
      })

    case HTTPoison.post("#{@api_url}/api/jwt/can", requestBody) do
      {:ok, %HTTPoison.Response{status_code: 200, body: _}} ->
        {:ok}

      {_, _} ->
        {:error}
    end
  end

  def can_listen_channel(%{"current_user" => current_user, "channel_id" => channel_id}) do
    requestBody =
      Poison.encode!(%{
        push_token: @push_token,
        current_user: current_user,
        channel_id: channel_id
      })

    case HTTPoison.post("#{@api_url}/api/jwt/can", requestBody) do
      {:ok, %HTTPoison.Response{status_code: 200, body: _}} ->
        {:ok}

      {_, _} ->
        {:error}
    end
  end

  def can_listen_thread(%{"current_user" => current_user, "thread_id" => thread_id}) do
    requestBody =
      Poison.encode!(%{
        push_token: @push_token,
        current_user: current_user,
        thread_id: thread_id
      })

    case HTTPoison.post("#{@api_url}/api/jwt/can", requestBody) do
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
    headers = [Authorization: "Bearer #{token}", Accept: "Application/json; Charset=utf-8"]

    requestBody =
      Poison.encode!(%{
        push_token: @push_token
      })

    Logger.info(@api_url)

    case HTTPoison.post("#{@api_url}/api/jwt/who", requestBody, headers) do
      {:ok, %HTTPoison.Response{status_code: 200, body: body}} ->
        {:ok, body}

      {_, _} ->
        {:error}
    end
  end
end
