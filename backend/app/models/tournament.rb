class Tournament < ApplicationRecord
	has_many :registrations, dependent: :destroy
	has_many :tournament_matches, dependent: :destroy
	has_many :users, through: :registrations
	has_many :team_profiles, through: :registrations

	FORMAT_TYPES = %w[single_elimination double_elimination].freeze
	STATUSES = %w[draft open in_progress completed].freeze
	TEAM_MODES = %w[solo team].freeze

	validates :format_type, inclusion: { in: FORMAT_TYPES }
	validates :status, inclusion: { in: STATUSES }
	validates :team_mode, inclusion: { in: TEAM_MODES }
	validates :max_players, numericality: { greater_than: 1 }

	def total_rounds
		players = [registrations.count, 2].max
		Math.log2(players).ceil
	end

	def as_api_json
		as_json.merge(
			'registrations_count' => registrations.count,
			'team_registrations_count' => registrations.where.not(team_profile_id: nil).count,
			'total_rounds' => total_rounds,
			'matches_count' => tournament_matches.count
		)
	end

	after_create_commit { broadcast_change('created') }
	after_update_commit { broadcast_change('updated') }
	after_destroy_commit { broadcast_change('destroyed') }

	private

	def broadcast_change(action)
		ActionCable.server.broadcast('live_updates', {
			resource: 'tournament',
			action: action,
			id: id,
			data: as_api_json
		})
	end
end
