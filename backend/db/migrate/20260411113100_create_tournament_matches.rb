class CreateTournamentMatches < ActiveRecord::Migration[8.0]
  def change
    create_table :tournament_matches do |t|
      t.references :tournament, null: false, foreign_key: true
      t.references :player_one, foreign_key: { to_table: :users }
      t.references :player_two, foreign_key: { to_table: :users }
      t.references :winner, foreign_key: { to_table: :users }
      t.integer :player_one_score, default: 0, null: false
      t.integer :player_two_score, default: 0, null: false
      t.integer :round_number, default: 1, null: false
      t.integer :position_in_round, default: 1, null: false
      t.string :bracket_side, default: 'winners', null: false
      t.string :status, default: 'pending', null: false
      t.datetime :started_at
      t.datetime :completed_at

      t.timestamps
    end

    add_index :tournament_matches, [:tournament_id, :round_number, :position_in_round], unique: true, name: 'index_tournament_matches_on_round_slot'
  end
end
