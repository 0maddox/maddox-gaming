class Api::V1::RegistrationsController < ApplicationController
    def index
      @registrations = Registration.all
      render json: @registrations
    end
  
    def create
      @registration = Registration.new(registration_params)
      if @registration.save
        render json: @registration, status: :created
      else
        render json: @registration.errors, status: :unprocessable_entity
      end
    end
  
    def destroy
      @registration = Registration.find(params[:id])
      @registration.destroy
      head :no_content
    end
  
    private
  
    def registration_params
      params.require(:registration).permit(:user_id, :tournament_id)
    end
  end
  