defmodule ChatsecWeb.RoomChannel do
  use Phoenix.Channel
  alias ChatsecWeb.Presence
  alias ChatsecWeb.ChannelState

  def join("room:" <> room_id, %{"username" => username}, socket)
      when is_binary(username) do
    if Presence.list(socket) |> map_size < 2 do
      send(self(), {:after_join, username})
      ChannelState.join(room_id, username)
      {:ok, assign(socket, user_id: username, room_id: room_id)}
    else
      {:error, %{reason: "room_full"}}
    end
  end

  def handle_in("publickey", %{"publickey" => publickey, "username" => username}, socket) do
    broadcast!(socket, "publickey", %{"publickey" => publickey, "username" => username})
    {:noreply, socket}
  end

  def handle_in("new_msg", %{"body" => body, "username" => username, "iv" => iv}, socket) do
    broadcast!(socket, "new_msg", %{
      "body" => body,
      "username" => username,
      "iv" => iv
    })

    {:noreply, socket}
  end

  def handle_in("adios", _, socket) do
    ChannelState.delete_room(socket.assigns.room_id)
    broadcast!(socket, "room_deleted", %{})
    {:noreply, socket}
  end

  def handle_info({:after_join, username}, socket) do
    track_user_presence(socket, username)
    broadcast!(socket, "after_join", %{"username" => username})
    {:noreply, socket}
  end

  def terminate(_, socket) do
    case Map.fetch(socket.assigns, :user_id) do
      {:ok, user_id} ->
        Presence.untrack(socket, user_id)

      :error ->
        :ok
    end

    case socket.assigns do
      %{user_id: username, room_id: room_id} -> ChannelState.leave(room_id, username)
      _ -> :ok
    end

    :ok
  end

  defp track_user_presence(socket, username) do
    Presence.track(socket, username, %{online_at: to_string(System.system_time(:second))})
    push(socket, "presence_state", Presence.list(socket))
  end
end
