module Payments
  class CheckoutInitiator
    def initialize(order:, customer:)
      @order = order
      @customer = customer
    end

    def call
      @order.gateway_name == 'daraja' ? initiate_daraja : initiate_flutterwave
    end

    private

    def initiate_daraja
      response = Payments::DarajaGateway.new.initiate_stk_push(order: @order, phone_number: @order.payment_phone)
      metadata = normalized_metadata.merge(
        'customer' => normalized_customer,
        'daraja' => response,
        'checkout_message' => 'Check your phone to complete the M-Pesa payment.'
      )

      @order.update!(
        payment_reference: response['CheckoutRequestID'].presence || @order.payment_reference,
        metadata: metadata
      )

      {
        provider: 'daraja',
        message: metadata['checkout_message'],
        action_required: 'check_phone'
      }
    end

    def initiate_flutterwave
      payment_config = Payments::FlutterwaveGateway.new.checkout_config(
        order: @order,
        customer: normalized_customer,
        payment_method: @order.payment_method
      )

      metadata = normalized_metadata.merge(
        'customer' => normalized_customer,
        'flutterwave' => {
          'payment_options' => payment_config[:payment_options],
          'meta' => payment_config[:meta]
        },
        'checkout_message' => 'Complete your card payment in the secure Flutterwave modal.'
      )

      @order.update!(metadata: metadata)

      {
        provider: 'flutterwave',
        payment_config: payment_config,
        message: metadata['checkout_message'],
        action_required: 'open_modal'
      }
    end

    def normalized_customer
      {
        name: @customer[:name],
        email: @customer[:email],
        phone_number: @customer[:phone_number]
      }.compact
    end

    def normalized_metadata
      @order.metadata.is_a?(Hash) ? @order.metadata.deep_dup : {}
    end
  end
end
