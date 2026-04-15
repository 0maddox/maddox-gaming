class ExpandTournamentsForEsportsSystem < ActiveRecord::Migration[8.0]
  def change
    add_column :tournaments, :status, :string, default: 'draft', null: false
    add_column :tournaments, :format_type, :string, default: 'single_elimination', null: false
    add_column :tournaments, :max_players, :integer, default: 16, null: false
    add_column :tournaments, :game_title, :string, default: 'CODM', null: false
    add_column :tournaments, :bracket_data, :json, default: {}, null: false
    add_column :tournaments, :live_updates_enabled, :boolean, default: true, null: false
    add_index :tournaments, :status
    add_index :tournaments, :format_type
  end
end
