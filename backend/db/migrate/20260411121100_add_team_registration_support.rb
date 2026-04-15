class AddTeamRegistrationSupport < ActiveRecord::Migration[8.0]
  def change
    change_column_null :registrations, :user_id, true
    add_reference :registrations, :team_profile, foreign_key: true
    add_index :registrations, [:team_profile_id, :tournament_id], unique: true, where: 'team_profile_id IS NOT NULL', name: 'index_registrations_on_team_and_tournament'
  end
end
