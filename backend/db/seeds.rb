# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

admin_email = 'nickkiim7@gmail.com'

admin_user = User.find_or_initialize_by(email: admin_email)
admin_user.username = 'nickkiim7'
admin_user.name = 'Nickkiim Admin'
admin_user.phone_number = '0712345678'
admin_user.password = 'Maddox311'
admin_user.password_confirmation = 'Maddox311'
admin_user.role = 'super_admin'
admin_user.admin = true
admin_user.save!

# Remove older generated demo products from previous seed format.
legacy_demo_names = Product::CATEGORIES.flat_map do |category|
	category_label = category.titleize
	(1..4).map { |i| "#{category_label} Demo Item #{i}" }
end

Product.where(name: legacy_demo_names).delete_all

def dummy_image_url(product_name)
	seed = product_name.to_s.downcase.gsub(/[^a-z0-9]+/, '-').gsub(/\A-|\-\z/, '')
	"https://picsum.photos/seed/#{seed}/960/540"
end

# Seed realistic category-specific dummy items (4 per category).
sample_catalog = {
	'for-you' => [
		{ name: 'Starter RGB Gaming Bundle', description: 'Curated starter set with controller grip caps, braided cable, and thumbstick extenders.', price: 49.99, stock: 26 },
		{ name: 'Streamer Desk Essentials Kit', description: 'Compact streaming add-on kit with anti-slip pad and cable organizer for cleaner setups.', price: 34.5, stock: 34 },
		{ name: 'Weekend Arena Upgrade Pack', description: 'General gaming accessories pack tuned for cross-platform casual and ranked sessions.', price: 59.0, stock: 19 },
		{ name: 'Mobile + Console Hybrid Pack', description: 'Dual-use bundle for players moving between mobile gaming and living-room consoles.', price: 72.99, stock: 15 }
	],
	'gamepads' => [
		{ name: 'Apex Pro Wireless Gamepad', description: 'Low-latency wireless controller with remappable back paddles and precision triggers.', price: 89.99, stock: 24 },
		{ name: 'PulseX Hall-Effect Controller', description: 'Drift-resistant hall-effect sticks with customizable dead zones and tournament profile modes.', price: 109.0, stock: 17 },
		{ name: 'Nova Lite USB-C Controller', description: 'Budget-friendly wired controller with textured grip and dual-vibration motors.', price: 39.99, stock: 48 },
		{ name: 'Titan Elite Modular Pad', description: 'Swappable sticks and faceplates with programmable macro keys for advanced play.', price: 129.99, stock: 11 }
	],
	'headphones' => [
		{ name: 'Valkyrie 7.1 Gaming Headset', description: 'Virtual 7.1 surround over-ear headset with detachable boom mic for competitive comms.', price: 94.99, stock: 22 },
		{ name: 'NightRaid ANC Headphones', description: 'Active noise-canceling headset designed for immersive long sessions and crisp voice chat.', price: 139.0, stock: 14 },
		{ name: 'Orbit Studio Gaming Cans', description: 'Balanced audio profile for FPS footsteps and cinematic open-world soundscapes.', price: 119.5, stock: 18 },
		{ name: 'EchoFrame Entry Headset', description: 'Affordable over-ear headset with memory foam cushions and in-line controls.', price: 54.99, stock: 31 }
	],
	'earphones' => [
		{ name: 'BlitzPods Low-Latency Earbuds', description: 'Gaming earbuds with low-latency mode and dual-device Bluetooth pairing.', price: 59.99, stock: 41 },
		{ name: 'Stealth In-Ear Pro Monitor', description: 'In-ear monitor style earphones tuned for directional audio in tactical shooters.', price: 74.0, stock: 27 },
		{ name: 'Rift USB-C Wired Earbuds', description: 'Lag-free wired USB-C earphones with clear vocal pickup for team chat.', price: 29.99, stock: 53 },
		{ name: 'Phantom Sport Gaming Buds', description: 'Sweat-resistant earphones suitable for mobile gaming sessions on the go.', price: 44.5, stock: 36 }
	],
	'joysticks' => [
		{ name: 'Falcon Flight Combat Stick', description: 'High-precision joystick with adjustable tension for flight and space simulators.', price: 149.99, stock: 10 },
		{ name: 'DriftMaster Arcade Stick', description: 'Arcade-grade lever and buttons optimized for fighting games and retro cabinets.', price: 119.0, stock: 13 },
		{ name: 'AeroSim Starter Joystick', description: 'Entry-level simulation stick with stable base and programmable controls.', price: 79.99, stock: 21 },
		{ name: 'Vector Twin-Stick Set', description: 'Dual-stick setup for mech and twin-stick shooter fans needing granular control.', price: 164.0, stock: 8 }
	],
	'consoles' => [
		{ name: 'Helios Mini Console', description: 'Compact living-room console with quick resume and fast SSD storage profile.', price: 399.99, stock: 7 },
		{ name: 'ArcStation Digital Edition', description: 'Disc-free console variant with optimized digital storefront performance.', price: 449.0, stock: 5 },
		{ name: 'NovaPlay Family Console', description: 'Family-focused console bundle including two controllers and party-ready setup.', price: 329.99, stock: 9 },
		{ name: 'CoreBox Performance Console', description: 'High-performance console package designed for stable 4K gameplay output.', price: 499.99, stock: 4 }
	],
	'gaming phones' => [
		{ name: 'Raptor X Gaming Phone 256GB', description: 'High refresh display gaming phone with active thermal design and shoulder triggers.', price: 699.99, stock: 12 },
		{ name: 'Nebula Pro Mobile Gamer 512GB', description: 'Flagship mobile gaming phone with advanced cooling chamber and stereo front speakers.', price: 899.0, stock: 6 },
		{ name: 'VoltPlay Midrange Gamer 128GB', description: 'Midrange phone tuned for smooth frame pacing in popular battle royale titles.', price: 429.99, stock: 18 },
		{ name: 'HyperEdge Lite Gaming Phone', description: 'Affordable gaming phone with high touch sampling and game boost profiles.', price: 349.5, stock: 20 }
	],
	'gaming sleeves' => [
		{ name: 'FrictionZero Finger Sleeves 4-Pack', description: 'Touch-optimized finger sleeves with breathable weave for stable aim control.', price: 12.99, stock: 120 },
		{ name: 'ProSwipe Carbon Sleeves 6-Pack', description: 'Premium conductive sleeves reducing drag for fast swipes and flick shots.', price: 18.5, stock: 84 },
		{ name: 'GripFlex Mobile Sleeve Set', description: 'Balanced grip sleeve set designed for MOBA and shooter mobile titles.', price: 14.0, stock: 97 },
		{ name: 'ShadowTouch Tournament Sleeves', description: 'Tournament-ready anti-sweat sleeves engineered for consistent touchscreen response.', price: 21.99, stock: 63 }
	],
	'triggers' => [
		{ name: 'ClawShot L1R1 Trigger Pair', description: 'Responsive mobile trigger pair for faster ADS and fire actions in FPS matches.', price: 19.99, stock: 72 },
		{ name: 'RapidTap Four-Trigger Kit', description: 'Four-button trigger setup with ergonomic clips for extended sessions.', price: 27.5, stock: 49 },
		{ name: 'PrecisionGrip Metal Triggers', description: 'Metal-framed triggers with improved tactile click and reduced travel distance.', price: 31.99, stock: 38 },
		{ name: 'AirClick Lightweight Triggers', description: 'Ultra-light clip-on triggers compatible with most phone case thicknesses.', price: 16.99, stock: 88 }
	],
	'gloves' => [
		{ name: 'GlideMesh Gaming Gloves', description: 'Breathable palm gloves that reduce sweat and improve grip on controllers.', price: 24.99, stock: 46 },
		{ name: 'ThermaGrip Winter Play Gloves', description: 'Warm lightweight gloves for cold-weather sessions without sacrificing dexterity.', price: 29.5, stock: 33 },
		{ name: 'ProAim Compression Gloves', description: 'Compression-fit gloves to reduce wrist fatigue during long ranked sessions.', price: 34.99, stock: 28 },
		{ name: 'ArcGrip Half-Finger Pair', description: 'Half-finger design for better tactile feedback and quick button response.', price: 21.0, stock: 54 }
	],
	'phone and ipad coolers' => [
		{ name: 'CryoSnap Magnetic Phone Cooler', description: 'Magnetic clip cooler with quiet fan profile for sustained high frame-rate gaming.', price: 49.99, stock: 25 },
		{ name: 'FrostDock Tablet Cooling Pad', description: 'Cooling pad sized for iPad and Android tablets with dual-fan airflow channels.', price: 64.0, stock: 16 },
		{ name: 'IcePulse RGB Mobile Cooler', description: 'RGB cooler with digital temperature indicator and USB-C power input.', price: 39.99, stock: 37 },
		{ name: 'ArcticCore Pro Cooling Module', description: 'Premium semiconductor cooler built for marathon streaming and gameplay sessions.', price: 79.99, stock: 12 }
	]
}

sample_catalog.each do |category, products|
	products.each do |attrs|
		product = Product.find_or_initialize_by(name: attrs[:name])
		product.category = category
		product.description = attrs[:description]
		product.price = attrs[:price]
		product.stock = attrs[:stock]
		product.image_url = attrs[:image_url] || dummy_image_url(attrs[:name])
		product.save!
	end
end
