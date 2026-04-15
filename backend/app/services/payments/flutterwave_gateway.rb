require 'cgi'
require 'json'
require 'net/http'

module Payments
  class FlutterwaveGateway
    class Error < StandardError; end

    SUCCESSFUL_STATUSES = %w[successful completed].freeze
    FAILED_STATUSES = %w[failed cancelled].freeze

    def initialize(secret_key: ENV['FLUTTERWAVE_SECRET'], webhook_hash: ENV['FLUTTERWAVE_WEBHOOK_SECRET_HASH'])
      @secret_key = secret_key.to_s
      @webhook_hash = webhook_hash.to_s
    end

    def checkout_config(order:, customer:, payment_method:)
      {
        tx_ref: order.payment_reference,
        amount: order.total_amount.to_f,
        currency: order.currency,
        payment_options: payment_options_for(payment_method),
        customer: {
          email: customer[:email],
          phonenumber: customer[:phone_number],
          name: customer[:name]
        }.compact,
        customizations: {
          title: ENV.fetch('PAYMENT_BUSINESS_NAME', 'Maddox Gaming'),
          description: "Payment for order ##{order.id}"
        },
        meta: {
          order_id: order.id,
          payment_method: payment_method
        }
      }
    end

    def verify_transaction(reference:)
      raise Error, 'Flutterwave secret is not configured' if @secret_key.blank?

      payload = request(:get, "transactions/verify_by_reference?tx_ref=#{CGI.escape(reference)}")
      data = payload['data'].is_a?(Hash) ? payload['data'] : {}
      gateway_status = data['status'].to_s.downcase

      {
        success: payload['status'].to_s == 'success' && SUCCESSFUL_STATUSES.include?(gateway_status),
        pending: gateway_status.blank? || gateway_status == 'pending',
        failed: FAILED_STATUSES.include?(gateway_status),
        status: gateway_status.presence || payload['status'].to_s.downcase,
        tx_ref: data['tx_ref'].presence || reference,
        transaction_id: data['id']&.to_s,
        amount: data['amount'],
        currency: data['currency'],
        payment_type: data['payment_type'],
        raw: payload
      }
    end

    def valid_webhook?(request)
      return true if @webhook_hash.blank? && !Rails.env.production?
      return false if @webhook_hash.blank?

      header_value = request.headers['verif-hash'].to_s
      return false if header_value.blank?

      ActiveSupport::SecurityUtils.secure_compare(header_value, @webhook_hash)
    end

    private

    def payment_options_for(payment_method)
      case payment_method
      when 'card'
        'card'
      when 'mpesa'
        'mobilemoneykenya'
      else
        'card,mobilemoneykenya'
      end
    end

    def request(method, path, body: nil)
      url = URI.parse("#{api_base_url}/#{path}")
      request_class = method == :get ? Net::HTTP::Get : Net::HTTP::Post
      request = request_class.new(url)
      request['Authorization'] = "Bearer #{@secret_key}"
      request['Content-Type'] = 'application/json'
      request.body = body.to_json if body

      response = Net::HTTP.start(url.hostname, url.port, use_ssl: true) do |http|
        http.request(request)
      end

      parsed = JSON.parse(response.body.presence || '{}')
      return parsed if response.is_a?(Net::HTTPSuccess)

      raise Error, parsed['message'].presence || 'Flutterwave request failed'
    rescue JSON::ParserError
      raise Error, 'Flutterwave returned an invalid response'
    end

    def api_base_url
      ENV.fetch('FLUTTERWAVE_API_URL', 'https://api.flutterwave.com/v3')
    end
  end
end
