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

  def handle_in("publickey_ack", %{"username" => username}, socket) do
    broadcast!(socket, "publickey_ack", %{"username" => username})
    {:noreply, socket}
  end

  def handle_in(
        "new_msg",
        %{"body" => body, "username" => username, "iv" => iv},
        socket
      ) do
    broadcast!(socket, "new_msg", %{
      "body" => body,
      "username" => username,
      "iv" => iv,
    })

    {:noreply, socket}
  end

  def handle_info({:after_join, username}, socket) do
    {:ok, _} =
      Presence.track(socket, username, %{online_at: to_string(System.system_time(:second))})

    broadcast!(socket, "after_join", %{"username" => username})

    push(socket, "presence_state", Presence.list(socket))
    {:noreply, socket}
  end

  def terminate(_, socket) do
    case socket.assigns do
      %{user_id: username, room_id: room_id} -> ChatsecWeb.ChannelState.leave(room_id, username)
      _ -> :ok
    end
  end
end
