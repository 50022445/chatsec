defmodule ChatsecWeb.PageController do
  use ChatsecWeb, :controller

  def home(conn, _params) do
    # The home page is often custom made,
    # so skip the default app layout.
    render(conn, :home, layout: false)
  end

  def chat(conn, %{"chatid" => _chatid}) do
    render(conn, :chat, layout: false)
  end
end
