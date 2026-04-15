module Payments
  class OrderStatusUpdater
    def initialize(order)
      @order = order
    end

    def apply_flutterwave_verification(verification)
      previous_status = @order.status
      metadata = normalized_metadata
      metadata['flutterwave'] ||= {}
      metadata['flutterwave']['verification'] = verification[:raw]

      attributes = {
        transaction_id: verification[:transaction_id],
        gateway_name: 'flutterwave',
        currency: verification[:currency].presence || @order.currency,
        metadata: metadata
      }

      if verification[:success]
        attributes[:status] = 'paid'
        attributes[:paid_at] = @order.paid_at || Time.current
      elsif verification[:failed]
        attributes[:status] = 'failed'
      else
        attributes[:status] = 'pending'
      end

      @order.update!(attributes.compact)
      clear_cart_if_paid
      notify_if_terminal_status_changed(previous_status)
      @order
    end

    def apply_daraja_callback(payload)
      previous_status = @order.status
      callback = payload.dig('Body', 'stkCallback') || {}
      metadata = normalized_metadata
      metadata['daraja'] ||= {}
      metadata['daraja']['callback'] = payload

      attributes = {
        gateway_name: 'daraja',
        transaction_id: extract_metadata_value(callback, 'MpesaReceiptNumber'),
        metadata: metadata
      }

      if callback['ResultCode'].to_i.zero?
        attributes[:status] = 'paid'
        attributes[:paid_at] = @order.paid_at || Time.current
      else
        attributes[:status] = 'failed'
      end

      @order.update!(attributes.compact)
      clear_cart_if_paid
      notify_if_terminal_status_changed(previous_status)
      @order
    end

    private

    def normalized_metadata
      @order.metadata.is_a?(Hash) ? @order.metadata.deep_dup : {}
    end

    def extract_metadata_value(callback, key)
      items = callback.dig('CallbackMetadata', 'Item')
      return nil unless items.is_a?(Array)

      item = items.find { |entry| entry['Name'] == key }
      item && item['Value']&.to_s
    end

    def clear_cart_if_paid
      @order.user.cart&.update!(items: []) if @order.paid?
    end

    def notify_if_terminal_status_changed(previous_status)
      return unless @order.status.in?(%w[paid failed])
      return if @order.status == previous_status

      Notifications::OrderNotifier.new(@order).deliver(status: @order.status)
    end
  end
end
