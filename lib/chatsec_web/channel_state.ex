defmodule ChatsecWeb.ChannelState do
  use GenServer

  def start_link(_) do
    GenServer.start_link(__MODULE__, [], name: __MODULE__)
  end

  def get_rooms() do
    GenServer.call(__MODULE__, {:list_rooms})
  end

  def create_room(room_id) do
    GenServer.call(__MODULE__, {:create, room_id})
  end

  def delete_room(room_id) do
    GenServer.call(__MODULE__, {:delete, room_id})
  end

  def list_users(room_id) do
    GenServer.call(__MODULE__, {:list, room_id})
  end

  def join(room_id, identifier) do
    GenServer.call(__MODULE__, {:join, room_id, identifier})
  end

  def leave(room_id, identifier) do
    GenServer.call(__MODULE__, {:leave, room_id, identifier})
  end

  @impl true
  def init(_) do
    initial_state = %{}
    {:ok, initial_state}
  end

  @impl true
  def handle_call({:list, room_id}, _from, state) do
    {:reply, Map.get(state, room_id), state}
  end

  @impl true
  def handle_call({:create, room_id}, _from, state) do
    {:reply, :ok,
      Map.put(state, room_id, [])}
  end

  @impl true
  def handle_call({:delete, room_id}, _from, state) do
    {:reply, :ok,
      Map.delete(state, room_id)}
  end

  @impl true
  def handle_call({:list_rooms}, _from, state) do
    {:reply, Map.keys(state), state}
  end

  @impl true
  def handle_call({:join, room_id, identifier}, _from, state) do
    {:reply, :ok,
     Map.update(state, room_id, [identifier], fn identifiers ->
       [identifier | Enum.reject(identifiers, &(&1 == identifier))]
     end)}
  end

  @impl true
  def handle_call({:leave, room_id, identifier}, _from, state) do
    {:reply, :ok,
     Map.update(state, room_id, [identifier], fn identifiers ->
       Enum.reject(identifiers, &(&1 == identifier))
     end)}
  end
end
