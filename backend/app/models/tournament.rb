class Tournament < ApplicationRecord
	has_many :registrations, dependent: :destroy
	has_many :users, through: :registrations

	after_create_commit { broadcast_change('created') }
	after_update_commit { broadcast_change('updated') }
	after_destroy_commit { broadcast_change('destroyed') }

	private

	def broadcast_change(action)
		ActionCable.server.broadcast('live_updates', {
			resource: 'tournament',
			action: action,
			id: id,
			data: as_json
		})
	end
end
