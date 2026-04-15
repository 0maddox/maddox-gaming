class LftPost < ApplicationRecord
  belongs_to :user

  STATUSES = %w[open closed].freeze

  validates :game_title, presence: true
  validates :role_needed, presence: true
  validates :slots_open, numericality: { greater_than: 0 }
  validates :status, inclusion: { in: STATUSES }

  scope :open_posts, -> { where(status: 'open') }

  def as_api_json
    as_json.merge(
      'author' => user.as_json(only: [:id, :username]),
      'is_open' => status == 'open'
    )
  end
end
