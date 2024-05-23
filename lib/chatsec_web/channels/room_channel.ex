defmodule ChatsecWeb.RoomChannel do
  use Phoenix.Channel

  def join("room:lobby", _message, socket) do
    {:ok, socket}
  end

  def join("room:" <> _private_room_id, _params, _socket) do
    {:error, %{reason: "unauthorized"}}
  end

  def handle_in("new_msg", %{"body" => body, "username" => username, "color" => color}, socket) do
    payload = %{message: body, username: username}
    spawn(fn -> save_messages(payload) end)

    broadcast!(socket, "new_msg", %{"body" => body, "username" => username, "color" => color})
    {:noreply, socket}
  end

  defp save_messages(attrs) do
    Chatsec.Message.changeset(%Chatsec.Message{}, attrs)
    |> Chatsec.Repo.insert()
  end
end
