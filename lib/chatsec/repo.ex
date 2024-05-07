defmodule Chatsec.Repo do
  use Ecto.Repo,
    otp_app: :chatsec,
    adapter: Ecto.Adapters.MyXQL
end
