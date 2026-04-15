require 'json'
require 'net/http'

module Notifications
  class SmsGateway
    def initialize(api_url: ENV['SMS_API_URL'], api_key: ENV['SMS_API_KEY'], sender_id: ENV['SMS_SENDER_ID'])
      @api_url = api_url.to_s
      @api_key = api_key.to_s
      @sender_id = sender_id.to_s
    end

    def deliver(phone_number:, message:)
      return { sent: false, skipped: true, reason: 'SMS provider not configured' } if @api_url.blank? || @api_key.blank?
      return { sent: false, skipped: true, reason: 'Phone number missing' } if phone_number.blank?

      uri = URI.parse(@api_url)
      request = Net::HTTP::Post.new(uri)
      request['Authorization'] = "Bearer #{@api_key}"
      request['Content-Type'] = 'application/json'
      request.body = {
        to: phone_number,
        message: message,
        sender_id: @sender_id.presence
      }.compact.to_json

      response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: uri.scheme == 'https') do |http|
        http.request(request)
      end

      parsed = JSON.parse(response.body.presence || '{}')

      {
        sent: response.is_a?(Net::HTTPSuccess),
        status_code: response.code.to_i,
        response: parsed
      }
    rescue JSON::ParserError
      {
        sent: response.is_a?(Net::HTTPSuccess),
        status_code: response.code.to_i,
        response: response.body.to_s
      }
    rescue StandardError => e
      {
        sent: false,
        error: e.message
      }
    end
  end
end
