ENV["BUNDLE_GEMFILE"] ||= File.expand_path("../Gemfile", __dir__)

def load_env_file(path)
	return unless File.exist?(path)

	File.foreach(path) do |line|
		stripped = line.strip
		next if stripped.empty? || stripped.start_with?('#') || !stripped.include?('=')

		key, value = stripped.split('=', 2)
		next if key.nil? || value.nil?

		cleaned_value = value.strip.gsub(/\A['"]|['"]\z/, '')
		ENV[key.strip] ||= cleaned_value
	end
end

rails_env = ENV.fetch('RAILS_ENV', ENV.fetch('APP_ENV', 'development'))
env_files = [
	File.expand_path("../.env.#{rails_env}.local", __dir__),
	File.expand_path('../.env.local', __dir__),
	File.expand_path('../.env', __dir__),
	File.expand_path("../../.env.#{rails_env}.local", __dir__),
	File.expand_path('../../.env.local', __dir__),
	File.expand_path('../../.env', __dir__)
]

env_files.each { |path| load_env_file(path) }

require "bundler/setup" # Set up gems listed in the Gemfile.
require "bootsnap/setup" # Speed up boot time by caching expensive operations.
