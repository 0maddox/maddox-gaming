class Product < ApplicationRecord
	CATEGORIES = [
		'for-you',
		'gamepads',
		'headphones',
		'earphones',
		'joysticks',
		'consoles',
		'gaming phones',
		'gaming sleeves',
		'triggers',
		'gloves',
		'phone and ipad coolers'
	].freeze

	has_many :reviews, dependent: :destroy
	has_one_attached :image

	attribute :variants, :json, default: []

	before_validation :normalize_category

	validates :category, inclusion: { in: CATEGORIES }
	validates :low_stock_threshold, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true

	after_create_commit { broadcast_change('created') }
	after_update_commit { broadcast_change('updated') }
	after_destroy_commit { broadcast_change('destroyed') }

	def stock_status
		stock_value = stock.to_i
		threshold = (has_attribute?('low_stock_threshold') ? self[:low_stock_threshold] : 5).to_i

		return 'out_of_stock' if stock_value <= 0
		return 'low_stock' if stock_value <= threshold

		'in_stock'
	end

	def average_rating
		reviews.average(:rating)&.to_f&.round(1) || 0.0
	end

	def ratings_count
		reviews.count
	end

	def image_url
		if image.attached?
			Rails.application.routes.url_helpers.rails_blob_url(image)
		else
			self[:image_url]
		end
	end

	def as_api_json
		as_json.merge(
			'low_stock_threshold' => (has_attribute?('low_stock_threshold') ? self[:low_stock_threshold] : 5),
			'image_url' => image_url,
			'stock_status' => stock_status,
			'average_rating' => average_rating,
			'ratings_count' => ratings_count
		)
	end

	private

	def normalize_category
		self.category = category.to_s.strip.downcase.presence || 'for-you'
	end

	def broadcast_change(action)
		ActionCable.server.broadcast('live_updates', {
			resource: 'product',
			action: action,
			id: id,
			data: as_api_json
		})
	end
end
