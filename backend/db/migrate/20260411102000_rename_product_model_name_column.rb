class RenameProductModelNameColumn < ActiveRecord::Migration[8.0]
  def change
    rename_column :products, :model_name, :variant_model
  end
end
