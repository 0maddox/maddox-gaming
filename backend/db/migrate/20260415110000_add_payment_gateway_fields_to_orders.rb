class AddPaymentGatewayFieldsToOrders < ActiveRecord::Migration[8.0]
  def change
    add_column :orders, :transaction_id, :string
    add_column :orders, :gateway_name, :string, default: 'flutterwave', null: false
    add_column :orders, :currency, :string, default: 'KES', null: false
    add_column :orders, :paid_at, :datetime

    add_index :orders, :payment_reference, unique: true
    add_index :orders, :transaction_id
    add_index :orders, :status
    add_index :orders, :gateway_name
  end
end
