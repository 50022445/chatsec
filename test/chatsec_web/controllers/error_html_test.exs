defmodule ChatsecWeb.ErrorHTMLTest do
  use ChatsecWeb.ConnCase, async: true

  test "a status with no dedicated template (e.g. 400) falls back instead of crashing" do
    assert Phoenix.Template.render_to_string(ChatsecWeb.ErrorHTML, "400", "html", []) ==
             "Bad Request"
  end

  test "a malformed request body doesn't crash the endpoint", %{conn: conn} do
    conn = put_req_header(conn, "content-type", "application/json")

    assert_error_sent 400, fn ->
      post(conn, "/", "{not valid json")
    end
  end
end
