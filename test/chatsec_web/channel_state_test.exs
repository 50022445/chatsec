defmodule ChatsecWeb.ChannelStateTest do
  use ExUnit.Case
  alias ChatsecWeb.ChannelState

  setup do
    pid = start_supervised!({ChannelState, name: :test})
    {:ok, pid: pid}
  end

  test "Create & delete a chatroom", %{pid: pid} do
    room_id = UUID.uuid4()
    assert :ok == ChannelState.create_room(pid, room_id)
    assert [room_id] == ChannelState.get_rooms(pid)
    assert :ok == ChannelState.delete_room(pid, room_id)
    assert [] == ChannelState.get_rooms(pid)
  end

  test "Add a new user to a chatroom", %{pid: pid} do
    room_id = UUID.uuid4()
    assert :ok == ChannelState.create_room(pid, room_id)
    assert [room_id] == ChannelState.get_rooms(pid)
    assert :ok == ChannelState.join(pid, room_id, "Slayer")
    assert ["Slayer"] == ChannelState.list_users(pid, room_id)
  end
end
