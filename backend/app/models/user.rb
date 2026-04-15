class User < ApplicationRecord
  ROLES = %w[
    user
    support_agent
    community_moderator
    tournament_manager
    catalog_manager
    content_admin
    marketing_manager
    analytics_viewer
    finance_admin
    super_admin
  ].freeze

  PERMISSIONS = {
    'purchase' => ROLES,
    'chat' => ROLES,
    'update_profile' => ROLES,
    'create_tournament' => %w[tournament_manager super_admin],
    'manage_tournaments' => %w[tournament_manager super_admin],
    'manage_products' => %w[catalog_manager super_admin],
    'manage_content' => %w[content_admin marketing_manager super_admin],
    'manage_users' => %w[community_moderator support_agent super_admin],
    'view_analytics' => %w[analytics_viewer finance_admin marketing_manager super_admin],
    'manage_finance' => %w[finance_admin super_admin],
    'assign_roles' => %w[super_admin]
  }.freeze

  has_secure_password
  has_one_attached :profile_picture
  has_one :cart, dependent: :destroy
  has_many :orders, dependent: :destroy
  has_many :reviews, dependent: :destroy
  has_many :player_one_matches, class_name: 'TournamentMatch', foreign_key: :player_one_id, dependent: :nullify
  has_many :player_two_matches, class_name: 'TournamentMatch', foreign_key: :player_two_id, dependent: :nullify
  has_many :won_matches, class_name: 'TournamentMatch', foreign_key: :winner_id, dependent: :nullify
  has_many :registrations
  has_many :tournaments, through: :registrations
  has_many :sent_follows, class_name: 'Follow', foreign_key: :follower_id, dependent: :destroy
  has_many :received_follows, class_name: 'Follow', foreign_key: :followed_id, dependent: :destroy
  has_many :discussion_threads, dependent: :destroy
  has_many :discussion_comments, dependent: :destroy
  has_many :lft_posts, dependent: :destroy

  before_validation :normalize_role
  before_save :sync_admin_flag

  validates :role, inclusion: { in: ROLES }
  validates :email, presence: true, uniqueness: true,
            format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :username, presence: true, uniqueness: true
  validates :phone_number, presence: true,
            format: { with: /\A(?:\+254|0)[17]\d{8}\z/,
                      message: 'must be a valid Kenyan phone number' }

  def profile_picture_url
    if profile_picture.attached?
      Rails.application.routes.url_helpers.rails_blob_url(profile_picture, only_path: true)
    end
  end

  def can?(permission)
    allowed_roles = PERMISSIONS[permission.to_s] || []
    allowed_roles.include?(role)
  end

  def super_admin?
    role == 'super_admin'
  end

  def community_profile_json
    codm_stats = CodmPlayerStat.where(player_name: username).order(updated_at: :desc).first
    matches_played = player_one_matches.count + player_two_matches.count

    as_json(only: [:id, :username, :email, :role]).merge(
      'avatar_url' => profile_picture_url,
      'stats' => {
        'followers' => received_follows.accepted.count,
        'following' => sent_follows.accepted.count,
        'tournaments_joined' => registrations.count,
        'matches_played' => matches_played,
        'matches_won' => won_matches.count,
        'codm_kills' => codm_stats&.kills.to_i,
        'codm_rank' => codm_stats&.in_game_rank.to_s
      }
    )
  end

  private

  def normalize_role
    self.role = role.presence || (admin ? 'super_admin' : 'user')
  end

  def sync_admin_flag
    self.admin = (role == 'super_admin')
  end
end