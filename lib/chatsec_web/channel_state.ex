defmodule ChatsecWeb.ChannelState do
  use GenServer

  def start_link(_) do
    GenServer.start_link(__MODULE__, [], name: __MODULE__)
  end

  def list(room_id) do
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
