class ApplicationController < ActionController::API
  before_action :authenticate_request
  attr_reader :current_user

  private

  def authenticate_request
    header = request.headers['Authorization']
    token = header.split(' ').last if header
    begin
      @decoded = JWT.decode(token, Rails.application.secret_key_base, true, algorithm: 'HS256')
      @current_user = User.find(@decoded[0]['user_id'])
    rescue JWT::DecodeError, ActiveRecord::RecordNotFound
      render json: { error: 'Unauthorized' }, status: :unauthorized
    end
  end

  def require_permission!(permission)
    return if current_user&.can?(permission)

    render json: { error: 'Forbidden' }, status: :forbidden
  end
end