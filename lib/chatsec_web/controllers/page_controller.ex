defmodule ChatsecWeb.PageController do
  alias ChatsecWeb.ChannelState
  use ChatsecWeb, :controller

  def home(conn, _params) do
    # The home page is often custom made,
    # so skip the default app layout.
    render(conn, :home, layout: false)
  end

  def create(conn, _params) do
    uuid = UUID.uuid4()
    ChannelState.create_room(uuid)
    redirect(conn, to: ~p"/chat/#{uuid}")
  end

  def chat(conn, %{"chat_id" => chatid}) do
    if chatid in ChannelState.get_rooms() do
      render(conn, :chat, layout: false)
    else
      render(conn, :error, layout: false)
    end
  end
end
