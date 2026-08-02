defmodule ChatsecWeb.PageControllerTest do
  use ChatsecWeb.ConnCase

  test "GET /", %{conn: conn} do
    conn = get(conn, ~p"/")
    assert html_response(conn, 200) =~ "ChatSec"
  end

  test "GET /health returns 200 for Traefik's healthcheck poll", %{conn: conn} do
    conn = get(conn, ~p"/health")
    assert response(conn, 200) == "OK"
  end
end
