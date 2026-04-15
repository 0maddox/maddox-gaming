class Api::V1::TeamProfilesController < ApplicationController
  skip_before_action :authenticate_request, only: [:index, :show]
  before_action :set_team, only: [:show, :update, :destroy]
  before_action -> { require_permission!('manage_tournaments') }, only: [:create, :update, :destroy]

  def index
    teams = TeamProfile.includes(:codm_player_stats).order(wins: :desc)
    render json: teams.map { |team| team_payload(team) }
  end

  def show
    render json: team_payload(@team)
  end

  def create
    team = TeamProfile.new(team_params)
    if team.save
      render json: team_payload(team), status: :created
    else
      render json: team.errors, status: :unprocessable_entity
    end
  end

  def update
    if @team.update(team_params)
      render json: team_payload(@team)
    else
      render json: @team.errors, status: :unprocessable_entity
    end
  end

  def destroy
    @team.destroy
    head :no_content
  end

  private

  def set_team
    @team = TeamProfile.find(params[:id])
  end

  def team_params
    params.require(:team_profile).permit(:name, :tag, :region, :wins, :losses, :bio, :logo_url)
  end

  def team_payload(team)
    team.as_json.merge(
      'win_rate' => team.win_rate,
      'players' => team.codm_player_stats.order(kills: :desc).map(&:as_api_json)
    )
  end
end
