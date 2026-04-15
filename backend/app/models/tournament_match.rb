class TournamentMatch < ApplicationRecord
  belongs_to :tournament
  belongs_to :player_one, class_name: 'User', optional: true
  belongs_to :player_two, class_name: 'User', optional: true
  belongs_to :winner, class_name: 'User', optional: true
  belongs_to :player_one_team, class_name: 'TeamProfile', optional: true
  belongs_to :player_two_team, class_name: 'TeamProfile', optional: true
  belongs_to :winner_team, class_name: 'TeamProfile', optional: true

  SIDES = %w[winners losers finals].freeze
  STATUSES = %w[pending live completed].freeze

  validates :bracket_side, inclusion: { in: SIDES }
  validates :status, inclusion: { in: STATUSES }
  validates :round_number, numericality: { greater_than: 0 }
  validates :position_in_round, numericality: { greater_than: 0 }

  after_update_commit :broadcast_live_update

  def as_api_json
    as_json(include: {
      player_one: { only: [:id, :username] },
      player_two: { only: [:id, :username] },
      winner: { only: [:id, :username] },
      player_one_team: { only: [:id, :name, :tag] },
      player_two_team: { only: [:id, :name, :tag] },
      winner_team: { only: [:id, :name, :tag] }
    })
  end

  private

  def broadcast_live_update
    ActionCable.server.broadcast('live_updates', {
      resource: 'tournament_match',
      action: 'updated',
      id: id,
      tournament_id: tournament_id,
      data: as_api_json
    })
  end
end
