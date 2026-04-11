class Api::V1::UsersController < ApplicationController
  skip_before_action :authenticate_request, only: [:create, :login]
  before_action :set_user, only: [:show, :update, :destroy]
  before_action -> { require_permission!('manage_users') }, only: [:index]

  def index
    @users = User.all
    render json: @users.as_json(except: [:password_digest])
  end

  def show
    unless current_user.id == @user.id || current_user.can?('manage_users')
      return render json: { error: 'Forbidden' }, status: :forbidden
    end

    render json: @user.as_json(except: [:password_digest])
  end

  def create
    @user = User.new(user_params)
    if @user.save
      token = encode_token({ user_id: @user.id })
      render json: { user: @user.as_json(except: [:password_digest]), token: token }, status: :created
    else
      render json: @user.errors, status: :unprocessable_entity
    end
  end

  def login
    @user = User.find_by(email: params[:email])
    if @user && @user.authenticate(params[:password])
      token = encode_token({ user_id: @user.id })
      render json: { user: @user.as_json(except: [:password_digest]), token: token }
    else
      render json: { error: "Invalid email or password" }, status: :unauthorized
    end
  end

  def update
    unless current_user.id == @user.id || current_user.can?('manage_users')
      return render json: { error: 'Forbidden' }, status: :forbidden
    end

    attrs = user_update_params

    if attrs[:role].present?
      unless current_user.can?('assign_roles')
        return render json: { error: 'Forbidden' }, status: :forbidden
      end
    end

    if @user.update(attrs)
      render json: @user.as_json(except: [:password_digest])
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
    params.require(:user).permit(:name, :username, :email, :password, :phone_number, :profile_picture)
  end

  def user_update_params
    permitted = [:name, :username, :email, :password, :phone_number, :profile_picture]
    permitted << :role if current_user&.can?('assign_roles')
    params.require(:user).permit(*permitted)
  end

  def encode_token(payload)
    JWT.encode(payload, Rails.application.secret_key_base)
  end
end