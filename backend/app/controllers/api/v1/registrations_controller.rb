class Api::V1::RegistrationsController < ApplicationController
  def index
    @registrations = current_user.registrations
    render json: @registrations.as_json(include: :tournament)
  end

  def create
    attrs = registration_params.to_h
    tournament = Tournament.find_by(id: attrs['tournament_id'] || attrs[:tournament_id])
    return render json: { error: 'Tournament not found' }, status: :not_found unless tournament

    @registration = Registration.new(registration_params)
    @registration.user = current_user if tournament.team_mode != 'team'

    if @registration.save
      render json: @registration.as_json(include: {
        user: { only: [:id, :username] },
        team_profile: { only: [:id, :name, :tag] }
      }), status: :created
    else
      render json: { error: @registration.errors.full_messages.join(', ') }, status: :unprocessable_entity
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
    params.require(:registration).permit(:tournament_id, :team_profile_id)
  end
end