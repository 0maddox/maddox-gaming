class Follow < ApplicationRecord
  belongs_to :follower, class_name: 'User'
  belongs_to :followed, class_name: 'User'

  STATUSES = %w[pending accepted].freeze

  validates :status, inclusion: { in: STATUSES }
  validates :follower_id, uniqueness: { scope: :followed_id }
  validate :cannot_follow_self

  scope :accepted, -> { where(status: 'accepted') }

  private

  def cannot_follow_self
    errors.add(:followed_id, 'cannot be yourself') if follower_id == followed_id
  end
end
