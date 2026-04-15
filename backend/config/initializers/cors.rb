# Be sure to restart your server when you modify this file.

# Avoid CORS issues when API is called from the frontend app.
# Handle Cross-Origin Resource Sharing (CORS) in order to accept cross-origin Ajax requests.

# Read more: https://github.com/cyu/rack-cors

allowed_origins = [
	'http://localhost:3001',
	'http://127.0.0.1:3001',
	'http://localhost:3000',
	'http://127.0.0.1:3000',
	'http://localhost:5173',
	'http://127.0.0.1:5173',
	'http://localhost:4173',
	'http://127.0.0.1:4173',
	ENV['BASE_URL']
].compact.uniq

extra_origins = ENV.fetch('CORS_ALLOWED_ORIGINS', '')
	.split(',')
	.map(&:strip)
	.reject(&:empty?)

allowed_origins.concat(extra_origins).uniq!

Rails.application.config.middleware.insert_before 0, Rack::Cors do
	allow do
		origins(*allowed_origins)

		resource '*',
			headers: :any,
			methods: [:get, :post, :put, :patch, :delete, :options, :head]
	end
end
