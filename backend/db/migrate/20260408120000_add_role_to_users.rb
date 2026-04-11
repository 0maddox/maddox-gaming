class AddRoleToUsers < ActiveRecord::Migration[8.0]
  def up
    add_column :users, :role, :string, null: false, default: 'user'
    add_index :users, :role

    execute <<~SQL.squish
      UPDATE users
      SET role = CASE
        WHEN admin = TRUE THEN 'super_admin'
        ELSE 'user'
      END
    SQL
  end

  def down
    remove_index :users, :role if index_exists?(:users, :role)
    remove_column :users, :role if column_exists?(:users, :role)
  end
end
