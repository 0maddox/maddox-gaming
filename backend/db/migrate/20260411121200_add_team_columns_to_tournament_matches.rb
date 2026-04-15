class AddTeamColumnsToTournamentMatches < ActiveRecord::Migration[8.0]
  def change
    add_reference :tournament_matches, :player_one_team, foreign_key: { to_table: :team_profiles }
    add_reference :tournament_matches, :player_two_team, foreign_key: { to_table: :team_profiles }
    add_reference :tournament_matches, :winner_team, foreign_key: { to_table: :team_profiles }
  end
end
