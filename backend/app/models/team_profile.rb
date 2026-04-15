class TeamProfile < ApplicationRecord
  has_many :codm_player_stats, dependent: :nullify
  has_many :registrations, dependent: :nullify
  has_many :tournaments, through: :registrations
  has_many :player_one_team_matches, class_name: 'TournamentMatch', foreign_key: :player_one_team_id, dependent: :nullify
  has_many :player_two_team_matches, class_name: 'TournamentMatch', foreign_key: :player_two_team_id, dependent: :nullify
  has_many :winner_team_matches, class_name: 'TournamentMatch', foreign_key: :winner_team_id, dependent: :nullify

  validates :name, presence: true
  validates :tag, presence: true, uniqueness: true

  def win_rate
    total = wins.to_i + losses.to_i
    return 0.0 if total.zero?

    ((wins.to_f / total) * 100).round(1)
  end
end
