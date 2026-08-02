defmodule ChatsecWeb.PageController do
  use ChatsecWeb, :controller
  alias ChatsecWeb.ChannelState

  # Deliberately outside the :browser pipeline (see router.ex) - no session,
  # CSRF, or layout work, just confirms the app is up and responding.
  def health(conn, _params) do
    send_resp(conn, 200, "OK")
  end

  def home(conn, _params) do
    render(conn, :home, layout: false)
  end

  def create_room(conn, _params) do
    uuid = UUID.uuid4()
    ChannelState.create_room(uuid)
    redirect(conn, to: ~p"/chat/#{uuid}")
  end

  def room_not_found(conn, _params) do
    render(conn, :room_not_found, layout: false)
  end

  def chat(conn, %{"chat_id" => chatid}) do
    if chatid in ChannelState.get_rooms() do
      render(conn, :chat, layout: false)
    else
      render(conn, :room_not_found, layout: false)
    end
  end
end
