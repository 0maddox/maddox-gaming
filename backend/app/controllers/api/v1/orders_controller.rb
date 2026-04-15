class Api::V1::OrdersController < ApplicationController
  def index
    orders = current_user.orders.order(created_at: :desc).limit(20)

    render json: {
      orders: orders.map { |order| serialize_order(order) }
    }
  end

  def show
    order = current_user.orders.find(params[:id])
    render json: { order: serialize_order(order) }
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Order not found' }, status: :not_found
  end

  def retry
    order = current_user.orders.find(params[:id])
    return render json: { error: 'Paid orders cannot be retried' }, status: :unprocessable_entity if order.paid?

    payment_phone = normalized_phone_number(params[:phone_number].presence || order.payment_phone || current_user.phone_number)
    if order.payment_method == 'mpesa' && payment_phone.blank?
      return render json: { error: 'A valid M-Pesa phone number is required' }, status: :unprocessable_entity
    end

    provider = order.payment_method == 'mpesa' ? 'daraja' : 'flutterwave'
    customer = {
      name: params[:customer_name].to_s.presence || order.metadata.dig('customer', 'name').presence || current_user.username.presence || current_user.name.presence || 'Customer',
      email: params[:customer_email].to_s.presence || order.metadata.dig('customer', 'email').presence || current_user.email,
      phone_number: payment_phone
    }

    order.update!(
      gateway_name: provider,
      payment_phone: payment_phone,
      status: 'pending',
      paid_at: nil,
      transaction_id: nil,
      payment_reference: refreshed_reference_for(provider),
      metadata: order.metadata.merge(
        'customer' => customer,
        'retry_count' => order.metadata.fetch('retry_count', 0).to_i + 1,
        'checkout_message' => order.payment_method == 'mpesa' ? 'Retry triggered. Check your phone for a new STK prompt.' : 'Retry started. Complete the payment in the Flutterwave modal.'
      )
    )

    payload = Payments::CheckoutInitiator.new(order: order, customer: customer).call

    render json: {
      order: serialize_order(order.reload),
      provider: payload[:provider],
      payment_config: payload[:payment_config],
      message: payload[:message],
      action_required: payload[:action_required]
    }
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Order not found' }, status: :not_found
  rescue Payments::FlutterwaveGateway::Error, Payments::DarajaGateway::Error => e
    order&.update(status: 'failed', metadata: order.metadata.merge('error' => e.message))
    render json: { error: e.message }, status: :unprocessable_entity
  end

  private

  def normalized_phone_number(raw_phone)
    digits = raw_phone.to_s.gsub(/\D/, '')

    return "254#{digits[1..]}" if digits.match?(/\A0[17]\d{8}\z/)
    return digits if digits.match?(/\A254[17]\d{8}\z/)

    nil
  end

  def refreshed_reference_for(provider)
    prefix = provider == 'daraja' ? 'DARAJA' : 'FLW'
    "#{prefix}-#{Time.current.strftime('%Y%m%d%H%M%S')}-#{SecureRandom.hex(4).upcase}"
  end

  def serialize_order(order)
    order.as_json.merge(
      'amount_breakdown' => order.metadata['amount_breakdown'],
      'checkout_message' => order.metadata['checkout_message'],
      'retry_count' => order.metadata['retry_count'].to_i,
      'retryable' => !order.paid?,
      'customer' => order.metadata['customer'],
      'notifications' => order.metadata['notifications']
    )
  end
end
