defmodule ChatsecWeb.RoomChannel do
  use Phoenix.Channel
  alias ChatsecWeb.ChannelState

  def join("room:lobby", %{"username" => username}, socket) when is_binary(username) do
    send(self(), {:user_joined, username})
    ChannelState.join("lobby", username)
    {:ok, assign(socket, user_id: username, room_id: "lobby")}
  end

  def join("room:" <> _private_room_id, _params, _socket) do
    send(self(), {:user_joined})
    {:error, %{reason: "unauthorized"}}
  end

  def handle_in("publickey", %{"publickey" => publickey, "username" => username}, socket) do
    broadcast!(socket, "publickey", %{
      "publickey" => publickey,
      "username" => username
    })

    {:noreply, socket}
  end

  def handle_in(
        "new_msg",
        %{"body" => body, "username" => username, "iv" => iv, "color" => color},
        socket
      ) do
    # payload = %{message: body, username: username}
    # spawn(fn -> save_messages(payload) end)

    broadcast!(socket, "new_msg", %{
      "body" => body,
      "username" => username,
      "iv" => iv,
      "color" => color
    })

    {:noreply, socket}
  end

  def handle_in("user_joined", _username, socket) do
    {:noreply, socket}
  end

  def handle_info({:user_joined, username}, socket) do
    broadcast!(socket, "user_joined", %{"username" => username})
    {:noreply, socket}
  end

  def terminate(_, socket) do
    case socket.assigns do
      %{user_id: username, room_id: room_id} -> ChatsecWeb.ChannelState.leave(room_id, username)
      _ -> :ok
    end
  end

  # defp save_messages(attrs) do
  #   Chatsec.Message.changeset(%Chatsec.Message{}, attrs)
  #   |> Chatsec.Repo.insert()
  # end
end
