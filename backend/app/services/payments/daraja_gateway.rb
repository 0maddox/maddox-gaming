require 'base64'
require 'json'
require 'net/http'

module Payments
  class DarajaGateway
    class Error < StandardError; end

    def initialize(
      consumer_key: ENV['MPESA_CONSUMER_KEY'],
      consumer_secret: ENV['MPESA_SECRET'].presence || ENV['MPESA_CONSUMER_SECRET'],
      shortcode: ENV['MPESA_SHORTCODE'],
      passkey: ENV['MPESA_PASSKEY'],
      callback_url: ENV['MPESA_CALLBACK_URL'].presence || default_callback_url
    )
      @consumer_key = consumer_key.to_s
      @consumer_secret = consumer_secret.to_s
      @shortcode = shortcode.to_s
      @passkey = passkey.to_s
      @callback_url = callback_url.to_s
    end

    def initiate_stk_push(order:, phone_number:)
      validate_configuration!

      payload = {
        BusinessShortCode: @shortcode,
        Password: generate_password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: order.total_amount.to_i,
        PartyA: phone_number,
        PartyB: @shortcode,
        PhoneNumber: phone_number,
        CallBackURL: @callback_url,
        AccountReference: "MaddoxGaming-#{order.id}",
        TransactionDesc: 'Payment'
      }

      request(:post, '/mpesa/stkpush/v1/processrequest', payload)
    end

    private

    def validate_configuration!
      missing = []
      missing << 'MPESA_CONSUMER_KEY' if @consumer_key.blank?
      missing << 'MPESA_SECRET or MPESA_CONSUMER_SECRET' if @consumer_secret.blank?
      missing << 'MPESA_SHORTCODE' if @shortcode.blank?
      missing << 'MPESA_PASSKEY' if @passkey.blank?
      missing << 'MPESA_CALLBACK_URL' if @callback_url.blank?
      raise Error, "Missing Daraja configuration: #{missing.join(', ')}" if missing.any?
    end

    def access_token
      url = URI.join(api_base_url, '/oauth/v1/generate?grant_type=client_credentials')
      request = Net::HTTP::Get.new(url)
      request.basic_auth(@consumer_key, @consumer_secret)

      response = Net::HTTP.start(url.hostname, url.port, use_ssl: true) do |http|
        http.request(request)
      end

      parsed = JSON.parse(response.body.presence || '{}')
      token = parsed['access_token'].to_s
      raise Error, 'Unable to obtain Daraja access token' if token.blank?

      token
    rescue JSON::ParserError
      raise Error, 'Daraja returned an invalid access token response'
    end

    def generate_password
      Base64.strict_encode64("#{@shortcode}#{@passkey}#{timestamp}")
    end

    def timestamp
      @timestamp ||= Time.current.strftime('%Y%m%d%H%M%S')
    end

    def request(method, path, body)
      url = URI.join(api_base_url, path)
      request = Net::HTTP::Post.new(url)
      request['Authorization'] = "Bearer #{access_token}"
      request['Content-Type'] = 'application/json'
      request.body = body.to_json

      response = Net::HTTP.start(url.hostname, url.port, use_ssl: true) do |http|
        http.request(request)
      end

      parsed = JSON.parse(response.body.presence || '{}')
      return parsed if response.is_a?(Net::HTTPSuccess)

      raise Error, parsed['errorMessage'].presence || parsed['ResponseDescription'].presence || 'Daraja request failed'
    rescue JSON::ParserError
      raise Error, 'Daraja returned an invalid response'
    end

    def api_base_url
      ENV.fetch('MPESA_API_BASE_URL', 'https://sandbox.safaricom.co.ke')
    end

    def default_callback_url
      base_url = ENV['BASE_URL'].to_s.sub(%r{/\z}, '')
      return nil if base_url.empty?

      "#{base_url}/api/mpesa/callback"
    end
  end
end
