class CreateFollows < ActiveRecord::Migration[8.0]
  def change
    create_table :follows do |t|
      t.references :follower, null: false, foreign_key: { to_table: :users }
      t.references :followed, null: false, foreign_key: { to_table: :users }
      t.string :status, null: false, default: 'pending'

      t.timestamps
    end

    add_index :follows, [:follower_id, :followed_id], unique: true
    add_index :follows, :status
  end
end
