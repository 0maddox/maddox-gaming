class Admin::TournamentsController < ApplicationController
    before_action :authenticate_admin!
    before_action :set_tournament, only: [:edit, :update, :destroy]
  
    def index
      @tournaments = Tournament.all.order(start_date: :asc)
    end
  
    def new
      @tournament = Tournament.new
    end
  
    def create
      @tournament = Tournament.new(tournament_params)
      
      if @tournament.save
        redirect_to admin_tournaments_path, notice: 'Tournament was successfully created.'
      else
        render :new
      end
    end
  
    def edit
    end
  
    def update
      if @tournament.update(tournament_params)
        redirect_to admin_tournaments_path, notice: 'Tournament was successfully updated.'
      else
        render :edit
      end
    end
  
    def destroy
      @tournament.destroy
      redirect_to admin_tournaments_path, notice: 'Tournament was successfully deleted.'
    end
  
    private
  
    def set_tournament
      @tournament = Tournament.find(params[:id])
    end
  
    def tournament_params
      params.require(:tournament).permit(
        :title, 
        :description, 
        :prize_pool, 
        :start_date, 
        :max_players,
        :game_mode,
        images: []
      )
    end
  end