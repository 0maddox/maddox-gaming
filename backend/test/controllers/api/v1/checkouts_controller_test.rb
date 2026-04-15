require 'test_helper'
require 'securerandom'

class Api::V1::CheckoutsControllerTest < ActionDispatch::IntegrationTest
  setup do
    ActionMailer::Base.deliveries.clear
    @user = User.create!(
      username: "buyer_#{SecureRandom.hex(4)}",
      email: "buyer_#{SecureRandom.hex(4)}@example.com",
      phone_number: '0712345678',
      password: 'password123',
      role: 'user'
    )
    token = JWT.encode({ user_id: @user.id }, Rails.application.secret_key_base, 'HS256')
    @headers = { 'Authorization' => "Bearer #{token}" }
  end

  test 'creates a daraja checkout order for mpesa' do
    fake_gateway = Object.new
    def fake_gateway.initiate_stk_push(order:, phone_number:)
      {
        'CheckoutRequestID' => "ws_CO_#{order.id}",
        'MerchantRequestID' => "merchant_#{phone_number}"
      }
    end

    with_stubbed_gateway(Payments::DarajaGateway, fake_gateway) do
      post api_v1_checkouts_url,
           params: {
             items: [
               { product_id: 1, name: 'Controller', quantity: 1, price: 1000 }
             ],
             payment_method: 'mpesa',
             phone_number: '0712345678',
             customer_name: 'Checkout Buyer',
             customer_email: 'checkout-buyer@example.com'
           },
           headers: @headers,
           as: :json
    end

    assert_response :created

    payload = JSON.parse(response.body)
    assert_equal 'daraja', payload['provider']
    assert_equal 'pending', payload.dig('order', 'status')
    assert_equal 'mpesa', payload.dig('order', 'payment_method')
    assert_equal 1250.0, payload.dig('order', 'total_amount').to_f
    assert_equal "ws_CO_#{payload.dig('order', 'id')}", payload.dig('order', 'payment_reference')
    assert_nil payload['payment_config']
  end

  test 'verifies a flutterwave payment, marks the order paid, and sends confirmations' do
    order = @user.orders.create!(
      items: [{ product_id: 1, name: 'Controller', quantity: 1, price: 1000 }],
      total_amount: 1250,
      payment_method: 'card',
      gateway_name: 'flutterwave',
      currency: 'KES',
      payment_phone: '254712345678',
      status: 'pending',
      payment_reference: 'FLW-VERIFY-123',
      metadata: {}
    )

    fake_gateway = Object.new
    def fake_gateway.verify_transaction(reference:)
      {
        success: true,
        pending: false,
        failed: false,
        transaction_id: 'tx-12345',
        currency: 'KES',
        raw: {
          'data' => {
            'id' => 12_345,
            'status' => 'successful',
            'tx_ref' => reference
          }
        }
      }
    end

    sms_gateway = Object.new
    def sms_gateway.deliver(phone_number:, message:)
      { sent: true, recipient: phone_number, body: message }
    end

    with_stubbed_gateway(Payments::FlutterwaveGateway, fake_gateway) do
      with_stubbed_gateway(Notifications::SmsGateway, sms_gateway) do
        post verify_api_v1_checkout_url(order), headers: @headers, as: :json
      end
    end

    assert_response :success
    assert_equal 'paid', order.reload.status
    assert_equal 'tx-12345', order.transaction_id
    assert_not_nil order.paid_at
    assert_equal 1, ActionMailer::Base.deliveries.size
    assert_equal true, order.metadata.dig('notifications', 'paid', 'email', 'sent')
    assert_equal true, order.metadata.dig('notifications', 'paid', 'sms', 'sent')
  end

  test 'retries a failed mpesa order through daraja' do
    order = @user.orders.create!(
      items: [{ product_id: 1, name: 'Controller', quantity: 1, price: 1000 }],
      total_amount: 1250,
      payment_method: 'mpesa',
      gateway_name: 'daraja',
      currency: 'KES',
      payment_phone: '254712345678',
      status: 'failed',
      payment_reference: 'DARAJA-OLD-123',
      metadata: {}
    )

    fake_gateway = Object.new
    def fake_gateway.initiate_stk_push(order:, phone_number:)
      {
        'CheckoutRequestID' => "retry_#{order.id}",
        'MerchantRequestID' => "merchant_#{phone_number}"
      }
    end

    with_stubbed_gateway(Payments::DarajaGateway, fake_gateway) do
      post retry_api_v1_order_url(order), headers: @headers, as: :json
    end

    assert_response :success
    payload = JSON.parse(response.body)
    assert_equal 'daraja', payload['provider']
    assert_equal 'pending', order.reload.status
    assert_equal "retry_#{order.id}", order.payment_reference
    assert_equal 1, payload.dig('order', 'retry_count')
  end

  private

  def with_stubbed_gateway(klass, fake_gateway)
    singleton_class = class << klass; self; end
    original_new = klass.method(:new)

    singleton_class.send(:define_method, :new) do |*args, **kwargs, &block|
      fake_gateway
    end

    yield
  ensure
    singleton_class.send(:define_method, :new) do |*args, **kwargs, &block|
      original_new.call(*args, **kwargs, &block)
    end
  end
end
