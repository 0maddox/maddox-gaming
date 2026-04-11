class AddCategoryToProducts < ActiveRecord::Migration[8.0]
  def up
    add_column :products, :category, :string, null: false, default: 'for-you'
    add_index :products, :category
  end

  def down
    remove_index :products, :category if index_exists?(:products, :category)
    remove_column :products, :category if column_exists?(:products, :category)
  end
end
