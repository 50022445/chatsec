defmodule ChatsecWeb.RoomChannel do
  use Phoenix.Channel

  def join("room:lobby", %{"username" => username}, socket) do
    send(self(), {:user_joined, username})
    {:ok, socket}
  end

  def join("room:" <> _private_room_id, _params, _socket) do
    {:error, %{reason: "unauthorized"}}
  end

  def handle_in("publickey", %{"publickey" => publickey, "username" => username}, socket) do
    broadcast!(socket, "publickey", %{
      "publickey" => publickey,
      "username" => username
    })

    {:noreply, socket}
  end

  def handle_in("new_msg", %{"body" => body, "username" => username, "iv" => iv, "color" => color}, socket) do
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

  def handle_in("user_joined", username, socket) do
      {:noreply, socket}
  end

  def handle_info({:user_joined, username}, socket) do
    broadcast!(socket, "user_joined", %{"username" => username})
    {:noreply, socket}
  end

  # defp save_messages(attrs) do
  #   Chatsec.Message.changeset(%Chatsec.Message{}, attrs)
  #   |> Chatsec.Repo.insert()
  # end
end
