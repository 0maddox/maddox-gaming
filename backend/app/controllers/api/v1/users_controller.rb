class Api::V1::UsersController < ApplicationController
  skip_before_action :authenticate_request, only: [:create, :login, :public_profiles]
  before_action :set_user, only: [:show, :update, :destroy]
  before_action -> { require_permission!('manage_users') }, only: [:index]

  def index
    @users = User.all
    render json: @users.map(&:as_api_json)
  end

  def show
    unless current_user.id == @user.id || current_user.can?('manage_users')
      return render json: { error: 'Forbidden' }, status: :forbidden
    end

    render json: @user.community_profile_json
  end

  def public_profiles
    users = User.order(created_at: :desc).limit(50)
    render json: users.map { |user| user.community_profile_json.except('email') }
  end

  def create
    @user = User.new(user_params)
    attach_profile_picture(@user)
    if @user.save
      token = encode_token({ user_id: @user.id })
      render json: { user: @user.as_api_json, token: token }, status: :created
    else
      render json: @user.errors, status: :unprocessable_entity
    end
  end

  def login
    @user = User.find_by(email: params[:email])
    if @user && @user.authenticate(params[:password])
      token = encode_token({ user_id: @user.id })
      render json: { user: @user.as_api_json, token: token }
    else
      render json: { error: "Invalid email or password" }, status: :unauthorized
    end
  end

  def update
    unless current_user.id == @user.id || current_user.can?('manage_users')
      return render json: { error: 'Forbidden' }, status: :forbidden
    end

    attrs = user_update_params
    attach_profile_picture(@user)

    if attrs[:role].present?
      unless current_user.can?('assign_roles')
        return render json: { error: 'Forbidden' }, status: :forbidden
      end
    end

    if @user.update(attrs)
      render json: @user.community_profile_json
    else
      render json: @user.errors, status: :unprocessable_entity
    end
  end

  def destroy
    require_permission!('manage_users')
    return if performed?

    @user.destroy
    head :no_content
  end

  private

  def set_user
    @user = User.find(params[:id])
  end

  def user_params
    params.require(:user).permit(:name, :username, :email, :password, :phone_number, :profile_picture, :profile_picture_signed_id)
  end

  def user_update_params
    permitted = [:name, :username, :email, :password, :phone_number, :profile_picture, :profile_picture_signed_id]
    permitted << :role if current_user&.can?('assign_roles')
    params.require(:user).permit(*permitted)
  end

  def attach_profile_picture(user)
    signed_id = params.dig(:user, :profile_picture_signed_id).presence
    return if signed_id.blank?

    user.profile_picture.attach(signed_id)
  end

  def encode_token(payload)
    JWT.encode(payload, ENV['JWT_SECRET'].presence || Rails.application.secret_key_base)
  end
end