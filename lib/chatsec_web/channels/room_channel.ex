defmodule ChatsecWeb.RoomChannel do
  use Phoenix.Channel
  alias ChatsecWeb.Presence
  alias ChatsecWeb.ChannelState

  def join("room:" <> private_room_id, %{"username" => username}, socket)
      when is_binary(username) do
    send(self(), {:after_join, username})
    ChannelState.join(private_room_id, username)
    {:ok, assign(socket, user_id: username, room_id: private_room_id)}
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

  def handle_in("adios", %{"username" => username}, socket) do
    broadcast!(socket, "room_deleted", %{"username" => username})
    {:noreply, socket}
  end

  def handle_info({:after_join, username}, socket) do
    track_user_presence(socket, username)
    broadcast!(socket, "after_join", %{"username" => username})
    {:noreply, socket}
  end

  def terminate(username, socket) do
    case socket.assigns do
      %{user_id: username, room_id: room_id} -> ChatsecWeb.ChannelState.leave(room_id, username)
      _ -> :ok
    end
    Presence.untrack(socket, username)
  end

  defp track_user_presence(socket, username) do
    Presence.track(socket, username, %{online_at: to_string(System.system_time(:second))})
    push(socket, "presence_state", Presence.list(socket))
  end
end
