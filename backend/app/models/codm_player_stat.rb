class CodmPlayerStat < ApplicationRecord
  belongs_to :team_profile, optional: true

  validates :player_name, presence: true

  def win_rate
    total = matches_played.to_i
    return 0.0 if total.zero?

    ((wins.to_f / total) * 100).round(1)
  end

  def as_api_json
    as_json.merge(
      'win_rate' => win_rate,
      'team' => team_profile&.as_json(only: [:id, :name, :tag, :region])
    )
  end
end
