class AddCommerceFieldsToProducts < ActiveRecord::Migration[8.0]
  def change
    add_column :products, :color, :string
    add_column :products, :model_name, :string
    add_column :products, :compatibility, :string
    add_column :products, :variants, :json, default: [], null: false
    add_column :products, :low_stock_threshold, :integer, default: 5, null: false
  end
end
