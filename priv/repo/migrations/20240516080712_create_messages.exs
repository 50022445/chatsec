defmodule Chatsec.Repo.Migrations.CreateMessages do
  use Ecto.Migration

  def change do
    create table(:messages) do
      add :username, :string
      add :message, :string

      timestamps(type: :utc_datetime)
    end
  end
end
