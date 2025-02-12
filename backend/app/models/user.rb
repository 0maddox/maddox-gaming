class User < ApplicationRecord
    has_secure_password
    has_one_attached :profile_picture
    has_many :registrations
    has_many :tournaments, through: :registrations
  
    validates :email, presence: true, uniqueness: true, 
              format: { with: URI::MailTo::EMAIL_REGEXP }
    validates :username, presence: true, uniqueness: true
    validates :phone_number, presence: true, 
              format: { with: /\A(?:\+254|0)[17]\d{8}\z/, 
                       message: "must be a valid Kenyan phone number" }
    
    def profile_picture_url
      if profile_picture.attached?
        Rails.application.routes.url_helpers.rails_blob_url(profile_picture, only_path: true)
      end
    end
  end