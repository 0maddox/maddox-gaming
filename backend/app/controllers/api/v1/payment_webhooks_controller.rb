class Api::V1::PaymentWebhooksController < ApplicationController
  skip_before_action :authenticate_request

  def flutterwave
    gateway = Payments::FlutterwaveGateway.new
    return head :unauthorized unless gateway.valid_webhook?(request)

    payload = JSON.parse(request.raw_post.presence || '{}')
    order = find_flutterwave_order(payload)

    if order
      verification = gateway.verify_transaction(reference: order.payment_reference)
      Payments::OrderStatusUpdater.new(order).apply_flutterwave_verification(verification)
    end

    head :ok
  rescue JSON::ParserError
    head :bad_request
  rescue Payments::FlutterwaveGateway::Error => e
    Rails.logger.error("Flutterwave webhook error: #{e.message}")
    head :unprocessable_entity
  end

  def mpesa_callback
    payload = JSON.parse(request.raw_post.presence || '{}')
    order = find_mpesa_order(payload)
    Payments::OrderStatusUpdater.new(order).apply_daraja_callback(payload) if order

    render json: { ResultCode: 0, ResultDesc: 'Accepted' }
  rescue JSON::ParserError
    render json: { ResultCode: 1, ResultDesc: 'Invalid JSON' }, status: :bad_request
  end

  private

  def find_flutterwave_order(payload)
    data = payload['data'].is_a?(Hash) ? payload['data'] : {}
    meta = data['meta'].is_a?(Hash) ? data['meta'] : {}

    Order.find_by(id: meta['order_id']) || Order.find_by(payment_reference: data['tx_ref'].to_s)
  end

  def find_mpesa_order(payload)
    callback = payload.dig('Body', 'stkCallback') || {}
    checkout_request_id = callback['CheckoutRequestID'].to_s
    merchant_request_id = callback['MerchantRequestID'].to_s

    Order.find_by(payment_reference: checkout_request_id) || Order.find_by(payment_reference: merchant_request_id)
  end
end
