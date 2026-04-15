class Api::V1::CodmPlayerStatsController < ApplicationController
  skip_before_action :authenticate_request, only: [:index, :show]
  before_action :set_player, only: [:show, :update, :destroy]
  before_action -> { require_permission!('manage_tournaments') }, only: [:create, :update, :destroy]

  def index
    players = CodmPlayerStat.includes(:team_profile).order(kills: :desc)
    render json: players.map(&:as_api_json)
  end

  def show
    render json: @player.as_api_json
  end

  def create
    player = CodmPlayerStat.new(player_params)
    if player.save
      render json: player.as_api_json, status: :created
    else
      render json: player.errors, status: :unprocessable_entity
    end
  end

  def update
    if @player.update(player_params)
      render json: @player.as_api_json
    else
      render json: @player.errors, status: :unprocessable_entity
    end
  end

  def destroy
    @player.destroy
    head :no_content
  end

  private

  def set_player
    @player = CodmPlayerStat.find(params[:id])
  end

  def player_params
    params.require(:codm_player_stat).permit(:player_name, :in_game_rank, :kills, :matches_played, :wins, :team_profile_id)
  end
end
