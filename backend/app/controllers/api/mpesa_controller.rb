class Api::MpesaController < ApplicationController
  SHIPPING_FEE = 250

  def pay
    items = normalize_items(params[:items])
    return render json: { error: 'Cart is empty' }, status: :unprocessable_entity if items.empty?

    phone_number = normalize_phone_number(params[:phone_number].presence || current_user.phone_number)
    return render json: { error: 'A valid M-Pesa phone number is required' }, status: :unprocessable_entity if phone_number.blank?

    subtotal_amount = items.sum { |item| item[:price].to_f * item[:quantity].to_i }
    shipping_amount = subtotal_amount.positive? ? SHIPPING_FEE : 0
    total_amount = subtotal_amount + shipping_amount

    customer = {
      name: params[:customer_name].to_s.presence || current_user.username.presence || current_user.name.presence || 'Customer',
      email: params[:customer_email].to_s.presence || current_user.email,
      phone_number: phone_number
    }

    order = current_user.orders.create!(
      items: items,
      total_amount: total_amount,
      payment_method: 'mpesa',
      gateway_name: 'daraja',
      currency: 'KES',
      payment_phone: phone_number,
      status: 'pending',
      payment_reference: payment_reference,
      metadata: {
        amount_breakdown: {
          subtotal: subtotal_amount,
          shipping: shipping_amount,
          total: total_amount
        }
      }
    )

    payload = Payments::CheckoutInitiator.new(order: order, customer: customer).call

    render json: {
      order: serialize_order(order.reload),
      provider: payload[:provider],
      message: payload[:message],
      action_required: payload[:action_required]
    }, status: :created
  rescue Payments::DarajaGateway::Error => e
    order&.update(status: 'failed', metadata: order.metadata.merge('error' => e.message))
    render json: { error: e.message }, status: :unprocessable_entity
   rescue ActiveRecord::RecordInvalid => e
     render json: { error: e.record.errors.full_messages.join(', ') }, status: :unprocessable_entity
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

   def normalize_phone_number(raw_phone)
     digits = raw_phone.to_s.gsub(/\D/, '')

     return "254#{digits[1..]}" if digits.match?(/\A0[17]\d{8}\z/)
     return digits if digits.match?(/\A254[17]\d{8}\z/)

     nil
   end

   def payment_reference
     "DARAJA-#{Time.current.strftime('%Y%m%d%H%M%S')}-#{SecureRandom.hex(4).upcase}"
   end

   def serialize_order(order)
     order.as_json.merge(
       'amount_breakdown' => order.metadata['amount_breakdown'],
       'checkout_message' => order.metadata['checkout_message'],
       'customer' => order.metadata['customer']
     )
   end
end
