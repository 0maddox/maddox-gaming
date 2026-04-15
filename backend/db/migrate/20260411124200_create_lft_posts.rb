class CreateLftPosts < ActiveRecord::Migration[8.0]
  def change
    create_table :lft_posts do |t|
      t.references :user, null: false, foreign_key: true
      t.string :game_title, null: false, default: 'CODM'
      t.string :role_needed, null: false
      t.string :rank_requirement
      t.string :region
      t.integer :slots_open, null: false, default: 1
      t.text :notes
      t.string :status, null: false, default: 'open'

      t.timestamps
    end

    add_index :lft_posts, :status
    add_index :lft_posts, :game_title
  end
end
