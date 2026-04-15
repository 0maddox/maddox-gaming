require 'test_helper'
require 'securerandom'

class Api::V1::PaymentWebhooksControllerTest < ActionDispatch::IntegrationTest
  setup do
    ActionMailer::Base.deliveries.clear
  end

  test 'accepts a flutterwave webhook and updates the order' do
    user = User.create!(
      username: "webhook_#{SecureRandom.hex(4)}",
      email: "webhook_#{SecureRandom.hex(4)}@example.com",
      phone_number: '0712345678',
      password: 'password123',
      role: 'user'
    )

    order = user.orders.create!(
      items: [{ product_id: 1, name: 'Controller', quantity: 1, price: 1000 }],
      total_amount: 1250,
      payment_method: 'card',
      gateway_name: 'flutterwave',
      currency: 'KES',
      status: 'pending',
      payment_reference: 'FLW-WEBHOOK-123',
      metadata: {}
    )

    fake_gateway = Object.new
    def fake_gateway.valid_webhook?(request)
      request.headers['verif-hash'] == 'test-hash'
    end

    def fake_gateway.verify_transaction(reference:)
      {
        success: true,
        pending: false,
        failed: false,
        transaction_id: 'webhook-tx-1',
        currency: 'KES',
        raw: {
          'data' => {
            'status' => 'successful',
            'tx_ref' => reference
          }
        }
      }
    end

    payload = {
      event: 'charge.completed',
      data: {
        tx_ref: order.payment_reference,
        meta: {
          order_id: order.id
        }
      }
    }

    sms_gateway = Object.new
    def sms_gateway.deliver(phone_number:, message:)
      { sent: true, recipient: phone_number, body: message }
    end

    with_stubbed_gateway(Payments::FlutterwaveGateway, fake_gateway) do
      with_stubbed_gateway(Notifications::SmsGateway, sms_gateway) do
        post api_v1_payments_flutterwave_webhook_url,
             params: payload.to_json,
             headers: {
               'Content-Type' => 'application/json',
               'verif-hash' => 'test-hash'
             }
      end
    end

    assert_response :success
    assert_equal 'paid', order.reload.status
    assert_equal 'webhook-tx-1', order.transaction_id
    assert_equal 1, ActionMailer::Base.deliveries.size
    assert_equal true, order.metadata.dig('notifications', 'paid', 'email', 'sent')
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
