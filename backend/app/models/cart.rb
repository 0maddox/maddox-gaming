class Cart < ApplicationRecord
  belongs_to :user

  attribute :items, :json, default: []

  validates :user_id, uniqueness: true
end
