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

	before_validation :normalize_category

	validates :category, inclusion: { in: CATEGORIES }

	after_create_commit { broadcast_change('created') }
	after_update_commit { broadcast_change('updated') }
	after_destroy_commit { broadcast_change('destroyed') }

	private

	def normalize_category
		self.category = category.to_s.strip.downcase.presence || 'for-you'
	end

	def broadcast_change(action)
		ActionCable.server.broadcast('live_updates', {
			resource: 'product',
			action: action,
			id: id,
			data: as_json
		})
	end
end
