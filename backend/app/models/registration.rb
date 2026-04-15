class Registration < ApplicationRecord
  belongs_to :user, optional: true
  belongs_to :tournament
  belongs_to :team_profile, optional: true

  validates :user_id, uniqueness: { scope: :tournament_id, message: 'already registered for this tournament' }, allow_nil: true
  validates :team_profile_id, uniqueness: { scope: :tournament_id, message: 'already registered for this tournament' }, allow_nil: true
  validate :participant_presence_for_mode
  validate :tournament_has_capacity

  private

  def tournament_has_capacity
    return unless tournament
    return if tournament.max_players.to_i <= 0
    return if tournament.registrations.where.not(id: id).count < tournament.max_players

    errors.add(:tournament_id, 'has reached max players')
  end

  def participant_presence_for_mode
    return unless tournament

    if tournament.team_mode == 'team'
      errors.add(:team_profile_id, 'is required for team tournaments') if team_profile_id.blank?
    else
      errors.add(:user_id, 'is required for solo tournaments') if user_id.blank?
    end
  end
end
