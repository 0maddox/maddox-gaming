class Api::V1::TournamentsController < ApplicationController
  skip_before_action :authenticate_request, only: [:index, :show, :matches]
  before_action :set_tournament, only: [:show, :update, :destroy]
  before_action :set_tournament, only: [:matches, :generate_bracket, :simulate_match, :update_match]
  before_action -> { require_permission!('manage_tournaments') }, only: [:create, :update, :destroy]
  before_action -> { require_permission!('manage_tournaments') }, only: [:generate_bracket, :simulate_match, :update_match]

  def index
    @tournaments = Tournament.all
    render json: @tournaments.map(&:as_api_json)
  end

  def show
    render json: @tournament.as_api_json.merge(
      'registrations' => @tournament.registrations.includes(:user).map do |registration|
        registration.as_json.merge(
          'user' => registration.user&.as_json(only: [:id, :username, :role]),
          'team_profile' => registration.team_profile&.as_json(only: [:id, :name, :tag])
        )
      end,
      'matches' => @tournament.tournament_matches.order(:round_number, :position_in_round).map(&:as_api_json)
    )
  end

  def create
    @tournament = Tournament.new(tournament_params)
    if @tournament.save
      render json: @tournament.as_api_json, status: :created
    else
      render json: @tournament.errors, status: :unprocessable_entity
    end
  end

  def update
    if @tournament.update(tournament_params)
      render json: @tournament.as_api_json
    else
      render json: @tournament.errors, status: :unprocessable_entity
    end
  end

  def matches
    render json: {
      tournament: @tournament.as_api_json,
      matches: @tournament.tournament_matches.order(:round_number, :position_in_round).map(&:as_api_json)
    }
  end

  def generate_bracket
    participant_key = @tournament.team_mode == 'team' ? :team_profile_id : :user_id
    participants = @tournament.registrations.where.not(participant_key => nil).pluck(participant_key).shuffle
    return render json: { error: 'At least 2 registered players are required.' }, status: :unprocessable_entity if participants.size < 2

    @tournament.tournament_matches.destroy_all
    slots = 2**Math.log2(participants.size).ceil
    seeded = participants + Array.new(slots - participants.size)

    pairings = seeded.each_slice(2).to_a
    pairings.each_with_index do |pair, index|
      one, two = pair
      winner_id = one if one.present? && two.blank?

      match_attrs = {
        player_one_score: winner_id == one ? 1 : 0,
        player_two_score: 0,
        status: winner_id.present? ? 'completed' : 'pending',
        round_number: 1,
        position_in_round: index + 1,
        bracket_side: 'winners',
        completed_at: winner_id.present? ? Time.current : nil
      }

      if @tournament.team_mode == 'team'
        match_attrs.merge!(player_one_team_id: one, player_two_team_id: two, winner_team_id: winner_id)
      else
        match_attrs.merge!(player_one_id: one, player_two_id: two, winner_id: winner_id)
      end

      @tournament.tournament_matches.create!(match_attrs)
    end

    @tournament.update!(
      status: 'in_progress',
      bracket_data: {
        generated_at: Time.current,
        slots: slots,
        format_type: @tournament.format_type,
        rounds: @tournament.total_rounds
      }
    )

    render json: {
      tournament: @tournament.as_api_json,
      matches: @tournament.tournament_matches.order(:round_number, :position_in_round).map(&:as_api_json)
    }
  end

  def simulate_match
    match = @tournament.tournament_matches.where(status: %w[pending live]).order(:round_number, :position_in_round).first
    return render json: { message: 'All matches are complete.' } if match.nil?

    if match.status == 'pending'
      match.update!(
        status: 'live',
        started_at: Time.current,
        player_one_score: rand(0..2),
        player_two_score: rand(0..2)
      )
      return render json: { message: 'Match moved to live state.', match: match.as_api_json }
    end

    p1 = [match.player_one_score, rand(1..4)].max
    p2 = [match.player_two_score, rand(0..3)].max
    p1 += 1 if p1 == p2
    winner_user_id = p1 > p2 ? match.player_one_id : match.player_two_id
    winner_team_id = p1 > p2 ? match.player_one_team_id : match.player_two_team_id

    match.update!(
      status: 'completed',
      player_one_score: p1,
      player_two_score: p2,
      winner_id: winner_user_id,
      winner_team_id: winner_team_id,
      completed_at: Time.current
    )

    advance_winner(match)

    render json: { message: 'Match completed and bracket advanced.', match: match.as_api_json }
  end

  def update_match
    match = @tournament.tournament_matches.find(params[:match_id])
    p1 = params[:player_one_score].to_i
    p2 = params[:player_two_score].to_i
    return render json: { error: 'Scores cannot be tied' }, status: :unprocessable_entity if p1 == p2

    winner_user_id = p1 > p2 ? match.player_one_id : match.player_two_id
    winner_team_id = p1 > p2 ? match.player_one_team_id : match.player_two_team_id

    match.update!(
      player_one_score: p1,
      player_two_score: p2,
      winner_id: winner_user_id,
      winner_team_id: winner_team_id,
      status: 'completed',
      started_at: match.started_at || Time.current,
      completed_at: Time.current
    )

    advance_winner(match)

    render json: { message: 'Manual score saved', match: match.as_api_json }
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
    params.require(:tournament).permit(:name, :date, :entry_fee, :status, :format_type, :max_players, :game_title, :live_updates_enabled, :team_mode)
  end

  def advance_winner(match)
    winner_user = match.winner_id
    winner_team = match.winner_team_id
    return if winner_user.blank? && winner_team.blank?

    total_rounds = @tournament.total_rounds
    if match.round_number >= total_rounds
      @tournament.update!(status: 'completed')
      return
    end

    next_round = match.round_number + 1
    next_position = ((match.position_in_round - 1) / 2) + 1

    next_match = @tournament.tournament_matches.find_or_initialize_by(
      round_number: next_round,
      position_in_round: next_position,
      bracket_side: 'winners'
    )

    if match.position_in_round.odd?
      next_match.player_one_id = winner_user
      next_match.player_one_team_id = winner_team
    else
      next_match.player_two_id = winner_user
      next_match.player_two_team_id = winner_team
    end

    next_match.status ||= 'pending'
    next_match.save!
  end
end