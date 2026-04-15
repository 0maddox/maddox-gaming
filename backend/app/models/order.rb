class Order < ApplicationRecord
  STATUSES = %w[pending paid failed].freeze
  PAYMENT_METHODS = %w[card mpesa].freeze
  GATEWAYS = %w[flutterwave daraja].freeze

  belongs_to :user

  attribute :items, :json, default: []
  attribute :metadata, :json, default: {}

  validates :status, presence: true, inclusion: { in: STATUSES }
  validates :payment_method, presence: true, inclusion: { in: PAYMENT_METHODS }
  validates :gateway_name, allow_blank: true, inclusion: { in: GATEWAYS }
  validates :total_amount, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true

  def paid?
    status == 'paid'
  end
end
