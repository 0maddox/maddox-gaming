class Api::V1::CheckoutsController < ApplicationController
  SHIPPING_FEE = 250

  def create
    items = normalize_items(params[:items])
    return render json: { error: 'Cart is empty' }, status: :unprocessable_entity if items.empty?

    payment_method = normalize_payment_method(params[:payment_method])
    payment_provider = normalize_payment_provider(params[:payment_provider], payment_method)
    payment_phone = normalize_phone_number(params[:phone_number].presence || current_user.phone_number)
    subtotal_amount = items.sum { |item| item[:price].to_f * item[:quantity].to_i }
    shipping_amount = subtotal_amount.positive? ? SHIPPING_FEE : 0
    total_amount = subtotal_amount + shipping_amount

    if payment_method == 'mpesa' && payment_phone.blank?
      return render json: { error: 'A valid M-Pesa phone number is required' }, status: :unprocessable_entity
    end

    order = current_user.orders.create!(
      items: items,
      total_amount: total_amount,
      payment_method: payment_method,
      gateway_name: payment_provider,
      currency: 'KES',
      payment_phone: payment_phone,
      status: 'pending',
      payment_reference: payment_reference(payment_provider),
      metadata: {
        amount_breakdown: {
          subtotal: subtotal_amount,
          shipping: shipping_amount,
          total: total_amount
        }
      }
    )

    customer = {
      name: params[:customer_name].to_s.presence || current_user.username.presence || current_user.name.presence || 'Customer',
      email: params[:customer_email].to_s.presence || current_user.email,
      phone_number: payment_phone
    }

    payload = Payments::CheckoutInitiator.new(order: order, customer: customer).call

    render json: {
      order: serialize_order(order.reload),
      provider: payload[:provider],
      payment_config: payload[:payment_config],
      message: payload[:message],
      action_required: payload[:action_required],
      simulated: false
    }, status: :created
  rescue Payments::FlutterwaveGateway::Error, Payments::DarajaGateway::Error => e
    order&.update(status: 'failed', metadata: order.metadata.merge('error' => e.message))
    render json: { error: e.message }, status: :unprocessable_entity
  rescue ActiveRecord::RecordInvalid => e
    render json: { error: e.record.errors.full_messages.join(', ') }, status: :unprocessable_entity
  end

  def verify
    order = current_user.orders.find(params[:id])

    if order.gateway_name != 'flutterwave'
      return render json: { error: 'Verification is only available for Flutterwave orders' }, status: :unprocessable_entity
    end

    verification = Payments::FlutterwaveGateway.new.verify_transaction(reference: order.payment_reference)
    Payments::OrderStatusUpdater.new(order).apply_flutterwave_verification(verification)

    render json: {
      order: serialize_order(order.reload),
      verified: verification[:success],
      message: order.paid? ? 'Payment confirmed.' : 'Payment is still pending confirmation.'
    }
  rescue Payments::FlutterwaveGateway::Error => e
    render json: { error: e.message }, status: :unprocessable_entity
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Order not found' }, status: :not_found
  end

  private

  def normalize_items(raw_items)
    return [] unless raw_items.is_a?(Array)

    raw_items.filter_map do |item|
      next unless item.is_a?(ActionController::Parameters) || item.is_a?(Hash)

      row = item.is_a?(ActionController::Parameters) ? item.to_unsafe_h.symbolize_keys : item.to_h.symbolize_keys
      quantity = row[:quantity].to_i
      product_id = row[:product_id].to_i

      next if quantity <= 0 || product_id <= 0

      {
        product_id: product_id,
        name: row[:name].to_s,
        quantity: quantity,
        price: row[:price].to_f,
        variant: (row[:variant].is_a?(Hash) ? row[:variant] : {})
      }
    end
  end

  def normalize_payment_method(raw_method)
    method = raw_method.to_s.downcase
    Order::PAYMENT_METHODS.include?(method) ? method : 'mpesa'
  end

  def normalize_payment_provider(raw_provider, payment_method)
    provider = raw_provider.to_s.downcase
    return 'daraja' if provider == 'daraja' && payment_method == 'mpesa'
    return 'flutterwave' if provider == 'flutterwave' && payment_method == 'card'

    payment_method == 'mpesa' ? 'daraja' : 'flutterwave'
  end

  def normalize_phone_number(raw_phone)
    digits = raw_phone.to_s.gsub(/\D/, '')

    return "254#{digits[1..]}" if digits.match?(/\A0[17]\d{8}\z/)
    return digits if digits.match?(/\A254[17]\d{8}\z/)

    nil
  end

  def payment_reference(provider)
    prefix = provider == 'daraja' ? 'DARAJA' : 'FLW'
    "#{prefix}-#{Time.current.strftime('%Y%m%d%H%M%S')}-#{SecureRandom.hex(4).upcase}"
  end

  def checkout_message(payment_method)
    return 'Check your phone to approve the M-Pesa prompt.' if payment_method == 'mpesa'

    'Complete your card payment in the secure Flutterwave modal.'
  end

  def serialize_order(order)
    order.as_json.merge(
      'amount_breakdown' => order.metadata['amount_breakdown'],
      'checkout_message' => order.metadata['checkout_message']
    )
  end
end
