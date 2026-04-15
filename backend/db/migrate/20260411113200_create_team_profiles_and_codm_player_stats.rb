class CreateTeamProfilesAndCodmPlayerStats < ActiveRecord::Migration[8.0]
  def change
    create_table :team_profiles do |t|
      t.string :name, null: false
      t.string :tag, null: false
      t.string :region
      t.integer :wins, default: 0, null: false
      t.integer :losses, default: 0, null: false
      t.text :bio
      t.string :logo_url

      t.timestamps
    end

    add_index :team_profiles, :tag, unique: true

    create_table :codm_player_stats do |t|
      t.references :team_profile, foreign_key: true
      t.string :player_name, null: false
      t.string :in_game_rank, null: false, default: 'Rookie'
      t.integer :kills, default: 0, null: false
      t.integer :matches_played, default: 0, null: false
      t.integer :wins, default: 0, null: false

      t.timestamps
    end

    add_index :codm_player_stats, :player_name
    add_index :codm_player_stats, :kills
  end
end
