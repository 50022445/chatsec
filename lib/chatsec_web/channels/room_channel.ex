defmodule ChatsecWeb.RoomChannel do
  use Phoenix.Channel
  alias ChatsecWeb.ChannelState

  def join("room:" <> private_room_id, %{"username" => username}, socket) when is_binary(username) do
    send(self(), {:user_joined, username})
    ChannelState.join(private_room_id, username)
    {:ok, assign(socket, user_id: username, room_id: private_room_id)}
  end

  def handle_in("publickey", %{"publickey" => publickey, "username" => username}, socket) do
    broadcast!(socket, "publickey", %{
      "publickey" => publickey,
      "username" => username
    })
    {:noreply, socket}
  end

  # def handle_in(
  #       "new_msg",
  #       %{"body" => body, "username" => username, "iv" => iv, "color" => color},
  #       socket
  #     ) do

  #   # payload = %{message: body, username: username}
  #   # spawn(fn -> save_messages(payload) end)

  #   broadcast!(socket, "new_msg", %{
  #     "body" => body,
  #     "username" => username,
  #     "iv" => iv,
  #     "color" => color
  #   })
  #   {:noreply, socket}
  # end

  def handle_in(
    "new_msg",
    %{"body" => body, "username" => username, "color" => color},
    socket
  ) do

# payload = %{message: body, username: username}
# spawn(fn -> save_messages(payload) end)

broadcast!(socket, "new_msg", %{
  "body" => body,
  "username" => username,
  "color" => color
})
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
