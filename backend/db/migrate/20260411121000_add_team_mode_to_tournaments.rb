class AddTeamModeToTournaments < ActiveRecord::Migration[8.0]
  def change
    add_column :tournaments, :team_mode, :string, default: 'solo', null: false
    add_index :tournaments, :team_mode
  end
end
