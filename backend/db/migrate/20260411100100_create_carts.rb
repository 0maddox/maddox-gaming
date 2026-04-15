class CreateCarts < ActiveRecord::Migration[8.0]
  def change
    create_table :carts do |t|
      t.references :user, null: false, foreign_key: true, index: { unique: true }
      t.json :items, default: [], null: false

      t.timestamps
    end
  end
end
