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
  has_many :registrations
  has_many :tournaments, through: :registrations

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

  private

  def normalize_role
    self.role = role.presence || (admin ? 'super_admin' : 'user')
  end

  def sync_admin_flag
    self.admin = (role == 'super_admin')
  end
end