require 'test_helper'
require 'securerandom'

class Api::MpesaControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = User.create!(
      username: "mpesa_#{SecureRandom.hex(4)}",
      email: "mpesa_#{SecureRandom.hex(4)}@example.com",
      phone_number: '0712345678',
      password: 'password123',
      role: 'user'
    )
    token = JWT.encode({ user_id: @user.id }, ENV['JWT_SECRET'].presence || Rails.application.secret_key_base, 'HS256')
    @headers = { 'Authorization' => "Bearer #{token}" }
  end

  test 'creates a dedicated mpesa payment order' do
    fake_gateway = Object.new
    def fake_gateway.initiate_stk_push(order:, phone_number:)
      {
        'CheckoutRequestID' => "mpesa_#{order.id}",
        'MerchantRequestID' => "merchant_#{phone_number}"
      }
    end

    with_stubbed_gateway(Payments::DarajaGateway, fake_gateway) do
      post '/api/mpesa/pay',
           params: {
             items: [
               { product_id: 1, name: 'Controller', quantity: 1, price: 1000 }
             ],
             phone_number: '0712345678',
             customer_name: 'Mpesa Buyer',
             customer_email: 'mpesa-buyer@example.com'
           },
           headers: @headers,
           as: :json
    end

    assert_response :created
    payload = JSON.parse(response.body)
    assert_equal 'daraja', payload['provider']
    assert_equal 'pending', payload.dig('order', 'status')
    assert_equal 'mpesa', payload.dig('order', 'payment_method')
    assert_equal "mpesa_#{payload.dig('order', 'id')}", payload.dig('order', 'payment_reference')
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
