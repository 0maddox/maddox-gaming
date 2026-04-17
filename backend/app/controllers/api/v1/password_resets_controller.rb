class Api::V1::PasswordResetsController < ApplicationController
  skip_before_action :authenticate_request

  def create
    user = User.find_by_normalized_email(params[:email])

    if user
      token = user.generate_password_reset_token!
      PasswordResetMailer.reset(user.id, token).deliver_now
    end

    render json: {
      message: 'If an account exists for that email, a password reset link has been sent.'
    }
  end

  def update
    user = User.find_by_password_reset_token(params[:token])

    unless user&.password_reset_token_valid?
      return render json: { error: 'This password reset link is invalid or has expired.' }, status: :unprocessable_entity
    end

    if params[:password].blank?
      return render json: { error: 'Password is required.' }, status: :unprocessable_entity
    end

    if user.update(password: params[:password], password_confirmation: params[:password_confirmation])
      user.clear_password_reset_token!
      render json: { message: 'Your password has been reset successfully.' }
    else
      render json: { error: user.errors.full_messages.to_sentence }, status: :unprocessable_entity
    end
  end
end