defmodule ChatsecWeb.ChatController do
  use ChatsecWeb, :controller

  def index(conn, _params) do
    render(conn, :index)
  end
end
