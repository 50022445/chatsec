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

  test "User joins a chatroom, then leaves", %{pid: pid} do
    room_id = UUID.uuid4()
    user = "Slayer"

    assert :ok == ChannelState.create_room(pid, room_id)
    assert [room_id] == ChannelState.get_rooms(pid)
    assert :ok == ChannelState.join(pid, room_id, user)
    assert [user] == ChannelState.list_users(pid, room_id)

    assert :ok == ChannelState.leave(pid, room_id, user)
    assert [] == ChannelState.list_users(pid, room_id)
  end
end
