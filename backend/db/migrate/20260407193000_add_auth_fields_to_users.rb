class AddAuthFieldsToUsers < ActiveRecord::Migration[8.0]
  def up
    add_column :users, :username, :string unless column_exists?(:users, :username)
    add_column :users, :phone_number, :string unless column_exists?(:users, :phone_number)
    add_column :users, :password_digest, :string unless column_exists?(:users, :password_digest)
    add_column :users, :admin, :boolean, default: false, null: false unless column_exists?(:users, :admin)

    add_index :users, :username, unique: true unless index_exists?(:users, :username)
    add_index :users, :email, unique: true unless index_exists?(:users, :email)
  end

  def down
    remove_index :users, :email if index_exists?(:users, :email)
    remove_index :users, :username if index_exists?(:users, :username)

    remove_column :users, :admin if column_exists?(:users, :admin)
    remove_column :users, :password_digest if column_exists?(:users, :password_digest)
    remove_column :users, :phone_number if column_exists?(:users, :phone_number)
    remove_column :users, :username if column_exists?(:users, :username)
  end
end