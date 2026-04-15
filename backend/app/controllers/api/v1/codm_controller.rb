class Api::V1::CodmController < ApplicationController
  skip_before_action :authenticate_request, only: [:index]

  def index
    players = CodmPlayerStat.includes(:team_profile).order(kills: :desc).limit(20)
    teams = TeamProfile.order(wins: :desc).limit(12)

    render json: {
      leaderboard: players.map(&:as_api_json),
      teams: teams.map do |team|
        team.as_json.merge('win_rate' => team.win_rate)
      end
    }
  end
end
