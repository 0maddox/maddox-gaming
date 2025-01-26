class Api::V1::TournamentsController < ApplicationController
    def index
      @tournaments = Tournament.all
      render json: @tournaments
    end
  
    def show
      @tournament = Tournament.find(params[:id])
      render json: @tournament
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
      @tournament = Tournament.find(params[:id])
      if @tournament.update(tournament_params)
        render json: @tournament
      else
        render json: @tournament.errors, status: :unprocessable_entity
      end
    end
  
    def destroy
      @tournament = Tournament.find(params[:id])
      @tournament.destroy
      head :no_content
    end
  
    private
  
    def tournament_params
      params.require(:tournament).permit(:name, :date, :entry_fee)
    end
  end
  