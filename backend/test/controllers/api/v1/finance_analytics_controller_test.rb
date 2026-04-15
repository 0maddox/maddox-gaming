require 'test_helper'
require 'securerandom'

class Api::V1::FinanceAnalyticsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @admin = User.create!(
      username: "finance_#{SecureRandom.hex(4)}",
      email: "finance_#{SecureRandom.hex(4)}@example.com",
      phone_number: '0712345678',
      password: 'password123',
      role: 'finance_admin'
    )
    @buyer = User.create!(
      username: "buyer_#{SecureRandom.hex(4)}",
      email: "buyer_#{SecureRandom.hex(4)}@example.com",
      phone_number: '0723456789',
      password: 'password123',
      role: 'user'
    )

    @buyer.orders.create!(
      items: [{ product_id: 1, name: 'Controller', quantity: 1, price: 1000 }],
      total_amount: 1250,
      payment_method: 'card',
      gateway_name: 'flutterwave',
      currency: 'KES',
      status: 'paid',
      payment_reference: 'FLW-FIN-1',
      paid_at: Time.current,
      metadata: {}
    )

    @buyer.orders.create!(
      items: [{ product_id: 2, name: 'Headset', quantity: 1, price: 800 }],
      total_amount: 1050,
      payment_method: 'mpesa',
      gateway_name: 'daraja',
      currency: 'KES',
      status: 'failed',
      payment_reference: 'DARAJA-FIN-2',
      metadata: {}
    )

    token = JWT.encode({ user_id: @admin.id }, Rails.application.secret_key_base, 'HS256')
    @headers = { 'Authorization' => "Bearer #{token}" }
  end

  test 'returns finance summary for authorized users' do
    get api_v1_finance_summary_url, headers: @headers, as: :json

    assert_response :success
    payload = JSON.parse(response.body)
    assert_equal 1250.0, payload['total_revenue']
    assert_equal 1, payload['paid_orders_count']
    assert_equal 1, payload['failed_orders_count']
    assert payload['daily_revenue'].is_a?(Array)
    assert_equal 'card', payload['payment_method_breakdown'].first['method']
  end
end
