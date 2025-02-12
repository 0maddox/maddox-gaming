class Api::V1::RegistrationsController < ApplicationController
  def index
    @registrations = current_user.registrations
    render json: @registrations.as_json(include: :tournament)
  end

  def create
    @registration = current_user.registrations.build(registration_params)
    if @registration.save
      render json: @registration, status: :created
    else
      render json: @registration.errors, status: :unprocessable_entity
    end
  end

  def destroy
    @registration = current_user.registrations.find(params[:id])
    @registration.destroy
    head :no_content
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Unauthorized' }, status: :unauthorized
  end

  private

  def registration_params
    params.require(:registration).permit(:tournament_id)
  end
end