class CreateOrders < ActiveRecord::Migration[8.0]
  def change
    create_table :orders do |t|
      t.references :user, null: false, foreign_key: true
      t.string :status, null: false, default: 'pending'
      t.string :payment_method, null: false
      t.string :payment_reference
      t.string :payment_phone
      t.decimal :total_amount, precision: 12, scale: 2, default: 0, null: false
      t.json :items, default: [], null: false
      t.json :metadata, default: {}, null: false

      t.timestamps
    end
  end
end
