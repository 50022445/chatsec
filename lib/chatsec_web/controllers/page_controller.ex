defmodule ChatsecWeb.PageController do
  alias ChatsecWeb.ChannelState
  use ChatsecWeb, :controller

  def home(conn, _params) do
    # The home page is often custom made,
    # so skip the default app layout.
    render(conn, :home, layout: false)
  end

  def create_room(conn, _params) do
    uuid = UUID.uuid4()
    ChannelState.create_room(uuid)
    redirect(conn, to: ~p"/chat/#{uuid}")
  end

  def delete_room(conn, %{"chat_id" => chatid}) do
    if chatid in ChannelState.get_rooms() do
      ChannelState.delete_room(chatid)
      redirect(conn, to: ~p"/")
    else
      render(conn, :room_not_found, layout: false)
    end
  end

  def chat(conn, %{"chat_id" => chatid}) do
    if chatid in ChannelState.get_rooms() do
      render(conn, :chat, layout: false)
    else
      render(conn, :room_not_found, layout: false)
    end
  end
end
