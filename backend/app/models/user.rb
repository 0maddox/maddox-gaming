require 'digest'
require 'securerandom'

class User < ApplicationRecord
  PASSWORD_RESET_WINDOW = 2.hours.freeze

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

  before_validation :normalize_email
  before_validation :normalize_role
  before_save :sync_admin_flag

  validates :role, inclusion: { in: ROLES }
  validates :email, presence: true, uniqueness: true,
            format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :username, presence: true, uniqueness: true
  validates :phone_number, presence: true,
            format: { with: /\A(?:\+254|0)[17]\d{8}\z/,
                      message: 'must be a valid Kenyan phone number' }

  scope :with_password_reset_digest, ->(digest) { where(password_reset_token_digest: digest) }

  def as_api_json
    as_json(except: [:password_digest]).merge(
      'role' => resolved_role,
      'profile_picture_url' => profile_picture_url,
      'avatar_url' => profile_picture_url
    )
  end

  def profile_picture_url
    if profile_picture.attached?
      Rails.application.routes.url_helpers.rails_blob_url(profile_picture)
    end
  end

  def can?(permission)
    allowed_roles = PERMISSIONS[permission.to_s] || []
		allowed_roles.include?(resolved_role)
  end

  def super_admin?
		resolved_role == 'super_admin'
  end

  def community_profile_json
    codm_stats = CodmPlayerStat.where(player_name: username).order(updated_at: :desc).first
    matches_played = player_one_matches.count + player_two_matches.count

    as_api_json.slice('id', 'username', 'email', 'role', 'profile_picture_url', 'avatar_url').merge(
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

  def resolved_role
    return self[:role] if has_attribute?('role') && self[:role].present?
    return 'super_admin' if has_attribute?('admin') && self[:admin]

    'user'
  end

  def self.find_by_normalized_email(email)
    normalized_email = email.to_s.strip.downcase
    find_by('LOWER(email) = ?', normalized_email)
  end

  def self.find_by_password_reset_token(token)
    return if token.blank?

    with_password_reset_digest(digest_password_reset_token(token)).first
  end

  def generate_password_reset_token!
    token = SecureRandom.urlsafe_base64(32)
    update!(
      password_reset_token_digest: self.class.digest_password_reset_token(token),
      password_reset_sent_at: Time.current
    )
    token
  end

  def password_reset_token_valid?
    password_reset_token_digest.present? && password_reset_sent_at.present? && password_reset_sent_at >= PASSWORD_RESET_WINDOW.ago
  end

  def clear_password_reset_token!
    update_columns(password_reset_token_digest: nil, password_reset_sent_at: nil)
  end

  private

  def self.digest_password_reset_token(token)
    Digest::SHA256.hexdigest(token.to_s)
  end

  def normalize_email
		self.email = email.to_s.strip.downcase
  end

  def normalize_role
		self.role = resolved_role if has_attribute?('role')
  end

  def sync_admin_flag
		self.admin = (resolved_role == 'super_admin') if has_attribute?('admin')
  end
end