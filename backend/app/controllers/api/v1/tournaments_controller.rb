class Api::V1::TournamentsController < ApplicationController
  skip_before_action :authenticate_request, only: [:index, :show]
  before_action :set_tournament, only: [:show, :update, :destroy]

  def index
    @tournaments = Tournament.all
    render json: @tournaments
  end

  def show
    render json: @tournament.as_json(
      include: { registrations: { include: :user } }
    )
  end

  def create
    @tournament = Tournament.new(tournament_params)
    if @tournament.save
      render json: @tournament, status: :created
    else
      render json: @tournament.errors, status: :unprocessable_entity
    end
  end

  def update
    if @tournament.update(tournament_params)
      render json: @tournament
    else
      render json: @tournament.errors, status: :unprocessable_entity
    end
  end

  def destroy
    @tournament.destroy
    head :no_content
  end

  private

  def set_tournament
    @tournament = Tournament.find(params[:id])
  end

  def tournament_params
    params.require(:tournament).permit(:name, :date, :entry_fee)
  end
end