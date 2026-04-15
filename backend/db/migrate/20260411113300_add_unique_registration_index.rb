class AddUniqueRegistrationIndex < ActiveRecord::Migration[8.0]
  def change
    add_index :registrations, [:user_id, :tournament_id], unique: true
  end
end
