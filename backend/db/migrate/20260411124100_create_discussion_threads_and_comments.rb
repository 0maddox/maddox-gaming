class CreateDiscussionThreadsAndComments < ActiveRecord::Migration[8.0]
  def change
    create_table :discussion_threads do |t|
      t.references :user, null: false, foreign_key: true
      t.string :title, null: false
      t.text :body, null: false
      t.string :topic_type
      t.integer :topic_id

      t.timestamps
    end

    add_index :discussion_threads, [:topic_type, :topic_id]

    create_table :discussion_comments do |t|
      t.references :discussion_thread, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.text :body, null: false

      t.timestamps
    end
  end
end
