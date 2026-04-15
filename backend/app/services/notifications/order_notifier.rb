module Notifications
  class OrderNotifier
    TERMINAL_STATUSES = %w[paid failed].freeze

    def initialize(order)
      @order = order
    end

    def deliver(status:)
      terminal_status = status.to_s
      return unless TERMINAL_STATUSES.include?(terminal_status)

      metadata = normalized_metadata
      metadata['notifications'] ||= {}
      return if metadata['notifications'][terminal_status].present?

      delivery_record = {
        'email' => deliver_email,
        'sms' => deliver_sms(terminal_status),
        'sent_at' => Time.current.iso8601
      }

      metadata['notifications'][terminal_status] = delivery_record
      @order.update_column(:metadata, metadata)
    end

    private

    def deliver_email
      return { 'sent' => false, 'skipped' => true, 'reason' => 'User email missing' } if @order.user&.email.blank?

      OrderMailer.payment_status(@order.id).deliver_now
      { 'sent' => true, 'recipient' => @order.user.email }
    rescue StandardError => e
      { 'sent' => false, 'error' => e.message }
    end

    def deliver_sms(status)
      phone_number = @order.payment_phone.presence || @order.user&.phone_number
      message = sms_message_for(status)
      Notifications::SmsGateway.new.deliver(phone_number: phone_number, message: message).stringify_keys
    end

    def normalized_metadata
      @order.metadata.is_a?(Hash) ? @order.metadata.deep_dup : {}
    end

    def sms_message_for(status)
      if status == 'paid'
        "Maddox Gaming: payment received for order ##{@order.id}. Ref #{@order.payment_reference}."
      else
        "Maddox Gaming: payment failed for order ##{@order.id}. Retry your checkout to try again."
      end
    end
  end
end
